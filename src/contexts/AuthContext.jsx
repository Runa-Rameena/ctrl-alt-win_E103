import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase/config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, name, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      })

      console.log('✅ User registered successfully')
      return userCredential
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful')
      return userCredential
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function logout() {
    try {
      console.log('Logging out...')
      await signOut(auth)
      setCurrentUser(null)
      setUserProfile(null)
      console.log('✅ Logout successful')
      window.location.reload() // Force reload to clear state
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout: ' + error.message)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user')
      setCurrentUser(user)
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            // Profile exists - load it
            setUserProfile(userDoc.data())
            console.log('✅ User profile loaded:', userDoc.data())
          } else {
            // Profile doesn't exist - AUTO-CREATE IT
            console.log('⚠️ User profile not found - creating automatically...')
            
            const newProfile = {
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: 'investor', // Default role
              createdAt: new Date().toISOString()
            }
            
            await setDoc(userDocRef, newProfile)
            setUserProfile(newProfile)
            console.log('✅ Auto-created user profile:', newProfile)
          }
        } catch (error) {
          console.error('❌ Error loading user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

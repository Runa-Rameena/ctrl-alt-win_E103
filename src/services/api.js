import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore'

// Test function
export async function testFirestore() {
  try {
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Hello from Firestore!',
      timestamp: serverTimestamp()
    })
    return testDoc.id
  } catch (error) {
    console.error('Firestore Error:', error)
    throw error
  }
}

// Create a new campaign
export async function createCampaign(campaignData) {
  try {
    const campaign = {
      ...campaignData,
      raisedAmount: 0,
      supportersCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
    }
    
    const docRef = await addDoc(collection(db, 'campaigns'), campaign)
    console.log('Campaign created with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw error
  }
}

// Get all campaigns (with optional category filter)
export async function getCampaigns(category = null) {
  try {
    let q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'))
    
    if (category) {
      q = query(
        collection(db, 'campaigns'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    const campaigns = []
    
    querySnapshot.forEach((doc) => {
      campaigns.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return campaigns
  } catch (error) {
    console.error('Error getting campaigns:', error)
    return []
  }
}

// Get single campaign by ID
export async function getCampaignById(id) {
  try {
    const docRef = doc(db, 'campaigns', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } else {
      throw new Error('Campaign not found')
    }
  } catch (error) {
    console.error('Error getting campaign:', error)
    throw error
  }
}

// Add support to a campaign
export async function addContribution(campaignId, contributionData) {
  try {
    // Add contribution document
    await addDoc(collection(db, 'contributions'), {
      campaignId,
      ...contributionData,
      createdAt: serverTimestamp(),
    })
    
    // Update campaign stats
    const campaignRef = doc(db, 'campaigns', campaignId)
    
    const updates = {
      supportersCount: increment(1)
    }
    
    // Only increment raised amount if it's funding type
    if (contributionData.type === 'funding' && contributionData.amount) {
      updates.raisedAmount = increment(contributionData.amount)
    }
    
    await updateDoc(campaignRef, updates)
    
    console.log('Contribution added successfully')
    return true
  } catch (error) {
    console.error('Error adding contribution:', error)
    throw error
  }
}

// Get contributions for a campaign
export async function getContributions(campaignId) {
  try {
    const q = query(
      collection(db, 'contributions'),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const contributions = []
    
    querySnapshot.forEach((doc) => {
      contributions.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return contributions
  } catch (error) {
    console.error('Error getting contributions:', error)
    return []
  }
}

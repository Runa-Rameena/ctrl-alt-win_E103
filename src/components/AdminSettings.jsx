import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { Check } from 'lucide-react'

export default function AdminSettings() {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [upiId, setUpiId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const settingsRef = doc(db, 'settings', 'payment')
      const settingsSnap = await getDoc(settingsRef)
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data()
        setQrCodeUrl(data.qrCodeUrl || '')
        setUpiId(data.upiId || '')
        setAccountNumber(data.accountNumber || '')
        setBankName(data.bankName || '')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  async function saveSettings() {
    if (!qrCodeUrl) {
      alert('⚠️ Please enter QR code image URL')
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'payment'), {
        qrCodeUrl: qrCodeUrl,
        upiId: upiId,
        accountNumber: accountNumber,
        bankName: bankName,
        updatedAt: new Date().toISOString()
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      alert('✅ Payment settings saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('❌ Error saving: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment QR Code Settings</h2>
      
      {/* Bank Name */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Bank Name
        </label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g., State Bank of India"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Account Number */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Account Number (Last 4 digits)
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="e.g., XXXX1234"
          maxLength={8}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* UPI ID */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          UPI ID *
        </label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@paytm"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-2">Example: 9876543210@ybl, admin@paytm</p>
      </div>

      {/* QR Code URL */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Payment QR Code Image URL *
        </label>
        <input
          type="text"
          value={qrCodeUrl}
          onChange={(e) => setQrCodeUrl(e.target.value)}
          placeholder="https://i.imgur.com/yourimage.png"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          Upload your QR code to <a href="https://imgur.com/upload" target="_blank" className="text-blue-600 underline">Imgur.com</a> or <a href="https://imgbb.com/" target="_blank" className="text-blue-600 underline">ImgBB.com</a> and paste the direct image URL here
        </p>
      </div>

      {/* QR Code Preview */}
      {qrCodeUrl && (
        <div className="mb-6">
          <p className="text-gray-700 font-semibold mb-2">QR Code Preview:</p>
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 inline-block">
            <img 
              src={qrCodeUrl} 
              alt="Payment QR Code" 
              className="w-64 h-64 object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                alert('❌ Invalid image URL. Please check the URL.')
              }}
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving || !qrCodeUrl}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Saving...
          </>
        ) : saved ? (
          <>
            <Check size={20} />
            Settings Saved!
          </>
        ) : (
          '💾 Save Payment Settings'
        )}
      </button>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 font-semibold mb-2">📝 How to upload QR code:</p>
        <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
          <li>Take screenshot of your UPI QR code</li>
          <li>Go to <a href="https://imgur.com/upload" target="_blank" className="underline font-semibold">Imgur.com</a> and upload the image</li>
          <li>Right-click on uploaded image → "Copy image address"</li>
          <li>Paste the URL in the field above</li>
          <li>Click "Save Payment Settings"</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Note:</strong> Users will scan this QR code to make payments. 
          They'll need to enter their UPI Transaction ID for verification.
        </p>
      </div>
    </div>
  )
}

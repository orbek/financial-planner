import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const Statements = () => {
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: '1',
      fileName: 'chase_statement_jan_2024.pdf',
      accountName: 'Chase Checking',
      uploadDate: '2024-01-15',
      transactionsAdded: 45,
      status: 'success',
    },
    {
      id: '2',
      fileName: 'amex_statement_dec_2023.pdf',
      accountName: 'American Express Card',
      uploadDate: '2024-01-10',
      transactionsAdded: 28,
      status: 'success',
    },
  ])

  // Mock accounts data for demo
  const accounts = [
    { id: '1', name: 'Chase Checking', type: 'Checking' },
    { id: '2', name: 'Wells Fargo Savings', type: 'Savings' },
    { id: '3', name: 'American Express Card', type: 'Credit Card' },
    { id: '4', name: 'Investment Account', type: 'Investment' },
  ]

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedAccountId) {
      toast.error('Please select an account first')
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful upload
      const transactionsAdded = Math.floor(Math.random() * 30) + 15
      
      // Add to upload history
      const newUpload = {
        id: Date.now().toString(),
        fileName: file.name,
        accountName: accounts.find(acc => acc.id === selectedAccountId)?.name || 'Unknown',
        uploadDate: new Date().toISOString().split('T')[0],
        transactionsAdded,
        status: 'success' as const,
      }
      
      setUploadHistory(prev => [newUpload, ...prev])
      toast.success(`Demo: Successfully processed ${transactionsAdded} transactions!`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Demo: Upload simulation failed')
    } finally {
      setIsUploading(false)
    }
  }, [selectedAccountId, accounts])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: !selectedAccountId || isUploading,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statement Upload</h1>
          <p className="text-gray-600">Upload PDF statements to automatically import transactions</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload New Statement</h3>
        
        {/* Account Selection */}
        <div className="mb-6">
          <label className="label">Select Account</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="input w-full max-w-md"
          >
            <option value="">Choose an account...</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : selectedAccountId
              ? 'border-gray-300 hover:border-primary-400'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary-600 mx-auto animate-spin" />
                <p className="text-lg font-medium text-gray-900">Processing statement...</p>
                <p className="text-sm text-gray-600">
                  Extracting transactions using AI. This may take a moment.
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                {isDragActive ? (
                  <p className="text-lg font-medium text-primary-600">
                    Drop your PDF statement here
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedAccountId
                        ? 'Drag & drop your PDF statement here, or click to browse'
                        : 'Please select an account first'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports PDF files up to 10MB
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure your PDF statement is from a recognized bank</li>
            <li>• The statement should contain transaction details with dates and amounts</li>
            <li>• AI will automatically categorize and import your transactions</li>
            <li>• Review imported transactions for accuracy</li>
          </ul>
        </div>
      </div>

      {/* Upload History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload History</h3>
        
        <div className="space-y-4">
          {uploadHistory.map((upload, index) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                  <p className="text-sm text-gray-500">
                    {upload.accountName} • {new Date(upload.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {upload.transactionsAdded} transactions
                  </p>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Success
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {uploadHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No statements uploaded yet</p>
              <p className="text-sm">Upload your first PDF statement to see the history</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Processing Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-purple-600" />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered Transaction Extraction</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our advanced AI technology automatically extracts transaction data from your PDF statements, 
              including dates, amounts, descriptions, and categories.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic categorization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Date recognition</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Amount parsing</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Statements
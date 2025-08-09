import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Download, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    transactionAlerts: false,
  })

  // Demo user data (since we're in demo mode)
  const user = {
    name: 'Carlos Barbosa',
    email: 'carlos@example.com'
  }

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Demo: Notification preference updated!')
  }

  const handleExportData = () => {
    toast.success('Demo: Data export would be generated!')
  }

  const handleDeleteAccount = () => {
    toast.error('Demo: Account deletion is disabled in demo mode')
  }

  const logout = () => {
    window.location.href = '/'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and data</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center space-x-4 mb-6">
          <User className="h-6 w-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="input w-full max-w-md"
              readOnly
            />
          </div>
          
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input w-full max-w-md"
              readOnly
            />
          </div>
          
          <p className="text-sm text-gray-500">
            This is demo mode with sample profile data.
          </p>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Bell className="h-6 w-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Budget Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when approaching budget limits</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={notifications.budgetAlerts}
                onChange={() => handleNotificationToggle('budgetAlerts')}
              />
              <div className="relative">
                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                  notifications.budgetAlerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform ${
                  notifications.budgetAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Goal Reminders</h3>
              <p className="text-sm text-gray-500">Monthly reminders about your financial goals</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={notifications.goalReminders}
                onChange={() => handleNotificationToggle('goalReminders')}
              />
              <div className="relative">
                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                  notifications.goalReminders ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform ${
                  notifications.goalReminders ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Transaction Alerts</h3>
              <p className="text-sm text-gray-500">Notifications for large transactions</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={notifications.transactionAlerts}
                onChange={() => handleNotificationToggle('transactionAlerts')}
              />
              <div className="relative">
                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                  notifications.transactionAlerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform ${
                  notifications.transactionAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Shield className="h-6 w-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Data Protection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your financial data is encrypted and securely stored. We never share your personal information.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span>Secure cloud storage</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span>Regular security audits</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span>GDPR compliant</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="btn btn-secondary btn-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Download className="h-6 w-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Export Your Data</h3>
            <p className="text-sm text-gray-500 mb-3">
              Download all your financial data in CSV format for backup or tax preparation.
            </p>
            <button 
              onClick={handleExportData}
              className="btn btn-secondary btn-sm"
            >
              Export Data
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 text-red-600">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="btn btn-danger btn-sm flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings
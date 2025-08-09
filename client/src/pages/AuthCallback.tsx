import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        navigate('/?error=oauth_error')
        return
      }

      if (!code) {
        console.error('No authorization code received')
        navigate('/?error=no_code')
        return
      }

      try {
        // Handle Google OAuth callback
        const success = await (auth as any).handleGoogleCallback(code)
        
        if (success) {
          navigate('/dashboard')
        } else {
          navigate('/?error=auth_failed')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        navigate('/?error=auth_failed')
      }
    }

    handleCallback()
  }, [searchParams, navigate, auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we sign you in
        </p>
      </motion.div>
    </div>
  )
}

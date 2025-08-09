import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

interface ForgotPasswordFormProps {
  onBack: () => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await apiService.forgotPassword(data.email)
      toast.success(response.message)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot password?
        </h2>
        <p className="text-gray-600">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={`input pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-lg w-full flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send reset link</span>
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to login</span>
        </button>
      </div>
    </motion.div>
  )
}

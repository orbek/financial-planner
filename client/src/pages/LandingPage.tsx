import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  PiggyBank, 
  Target, 
  Brain,
  ArrowRight,
  CheckCircle 
} from 'lucide-react'
import { AuthModal } from '../components/auth'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { isLoading } = useAuth()

  const handleSignIn = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'AI-powered insights into your spending patterns and financial health',
    },
    {
      icon: PiggyBank,
      title: 'Budget Management',
      description: 'Set and track budgets with intelligent alerts and recommendations',
    },
    {
      icon: Target,
      title: 'Financial Goals',
      description: 'Set savings goals and track progress with visual timelines',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get personalized financial advice powered by machine learning',
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: 'Your data is protected with enterprise-grade encryption',
    },
    {
      icon: TrendingUp,
      title: 'Investment Tracking',
      description: 'Monitor your portfolio performance and investment gains',
    },
  ]

  const benefits = [
    'Multi-account management across banks',
    'Automatic transaction categorization',
    'PDF statement upload and parsing',
    'Real-time financial health scoring',
    'Customizable budget alerts',
    'Goal progress visualization',
    'AI-powered spending insights',
    'Export data for tax preparation',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                FinancePlanner
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="btn btn-secondary btn-md flex items-center space-x-2"
              >
                <span>Sign In</span>
              </button>
              <button
                onClick={handleSignUp}
                disabled={isLoading}
                className="btn btn-primary btn-md flex items-center space-x-2"
              >
                <span>Sign Up</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6"
            >
              Take Control of Your{' '}
              <span className="text-gradient">Financial Future</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              The most advanced personal finance app with AI-powered insights, 
              smart budgeting, and comprehensive financial tracking.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button
                onClick={handleSignUp}
                disabled={isLoading}
                className="btn btn-primary btn-lg px-8 py-3 text-lg"
              >
                Get Started Free
              </button>
              
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From basic budgeting to advanced analytics, our platform provides all the tools 
              you need for comprehensive financial management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose FinancePlanner?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built for modern financial management with cutting-edge technology 
                and user-centered design.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-white rounded-xl shadow-xl p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Financial Health Score
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get a comprehensive view of your financial wellness
                  </p>
                  <div className="text-4xl font-bold text-green-600 mb-2">85</div>
                  <div className="text-sm text-gray-500">Excellent Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who have taken control of their finances with FinancePlanner.
          </p>
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg px-8 py-3 text-lg font-semibold"
          >
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-primary-400" />
            <span className="ml-2 text-lg font-semibold text-white">
              FinancePlanner
            </span>
          </div>
          <p className="text-sm">
            © 2024 FinancePlanner. All rights reserved. Built with React & TypeScript.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  )
}

export default LandingPage

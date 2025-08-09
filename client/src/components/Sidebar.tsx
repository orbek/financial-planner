import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpDown,
  FileText,
  Target,
  PiggyBank,
  Settings,
  TrendingUp,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: CreditCard },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { name: 'Statements', href: '/statements', icon: FileText },
  { name: 'Budget', href: '/budget', icon: PiggyBank },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              FinancePlanner
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.div
                    className="flex items-center w-full"
                    whileHover={{ x: isActive ? 0 : 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Bottom section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500">
            <p>© 2024 FinancePlanner</p>
            <p>Version 2.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

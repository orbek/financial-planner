import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
  }
}

const authService = new AuthService()

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required', status: 401 } })
    }

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return res.status(403).json({ error: { message: 'Invalid or expired token', status: 403 } })
    }

    // Check if user still exists
    const user = await authService.getUserById(decoded.userId)
    if (!user) {
      return res.status(403).json({ error: { message: 'User not found', status: 403 } })
    }

    req.user = { userId: decoded.userId }
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(403).json({ error: { message: 'Authentication failed', status: 403 } })
  }
}

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = authService.verifyToken(token)
      if (decoded) {
        const user = await authService.getUserById(decoded.userId)
        if (user) {
          req.user = { userId: decoded.userId }
        }
      }
    }

    next()
  } catch (error) {
    // Don't fail on optional auth errors
    next()
  }
}

// Admin role check (placeholder for future use)
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Authentication required', status: 401 } })
    }

    // In the future, check if user has admin role
    // For now, all authenticated users can access admin endpoints
    next()
  } catch (error) {
    return res.status(403).json({ error: { message: 'Admin access required', status: 403 } })
  }
}
import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { AuthService } from '../services/auth'
import { authenticateToken } from '../middleware/auth'
import rateLimit from 'express-rate-limit'

const router = Router()
const authService = new AuthService()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

// Register with email/password
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() })
    }

    const { email, name, password } = req.body
    const result = await authService.registerWithEmail({ email, name, password, provider: 'email' })

    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      tokens: result.tokens
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(400).json({ error: error.message || 'Registration failed' })
  }
})

// Login with email/password
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() })
    }

    const { email, password } = req.body
    const result = await authService.loginWithEmail({ email, password })

    res.json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(401).json({ error: error.message || 'Authentication failed' })
  }
})

// Google OAuth login URL
router.get('/google/url', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    
    if (!clientId) {
      return res.status(500).json({ error: 'Google OAuth not configured' })
    }

    const scope = 'openid profile email'
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`

    res.json({ authUrl })
  } catch (error) {
    console.error('Google auth URL error:', error)
    res.status(500).json({ error: 'Failed to generate auth URL' })
  }
})

// Google OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Google OAuth not configured' })
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange code for token')
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Google')
    }

    // Login/register user
    const result = await authService.loginWithGoogle(googleUser)

    res.json({
      message: 'Google login successful',
      user: result.user,
      tokens: result.tokens
    })
  } catch (error: any) {
    console.error('Google callback error:', error)
    res.status(400).json({ error: error.message || 'Google authentication failed' })
  }
})

// Legacy Microsoft auth endpoints for backward compatibility
router.get('/signin-url', async (req, res) => {
  try {
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/auth/microsoft/url`)
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to generate auth URL', status: 500 } })
  }
})

router.post('/callback', async (req, res) => {
  try {
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/auth/microsoft/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }
    
    // Transform response to match old format
    res.json({
      token: data.tokens.access_token,
      user: data.user,
      expiresIn: data.tokens.expires_in * 1000
    })
  } catch (error) {
    res.status(500).json({ error: { message: 'Authentication failed', status: 500 } })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const tokens = await authService.refreshToken(refresh_token)
    
    res.json({
      message: 'Token refreshed successfully',
      tokens
    })
  } catch (error: any) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: error.message || 'Failed to refresh token' })
  }
})

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      await authService.logout(token)
    }
    
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId
    const user = await authService.getUserById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user info' })
  }
})

// Legacy validate endpoint
router.get('/validate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId
    const user = await authService.getUserById(userId)
    
    res.json({ valid: true, user })
  } catch (error) {
    res.status(403).json({ error: { message: 'Invalid token', status: 403 } })
  }
})

// Send password reset email
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() })
    }

    const { email } = req.body
    await authService.sendPasswordResetEmail(email)
    
    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent' })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.json({ message: 'If an account with that email exists, a password reset link has been sent' })
  }
})

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  })
})

export default router
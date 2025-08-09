import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { User, CreateUserData, LoginCredentials, AuthTokens, AuthResponse } from '../models/User'
import { isLocalDatabase } from '../config/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '24h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// In-memory storage for demo purposes (replace with real database in production)
const users: Map<string, any> = new Map()
const usersByEmail: Map<string, any> = new Map()

export class AuthService {
  // Generate JWT tokens
  generateTokens(userId: string): AuthTokens {
    const access_token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    const refresh_token = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
    
    return {
      access_token,
      refresh_token,
      expires_in: 24 * 60 * 60 // 24 hours in seconds
    }
  }

  // Verify JWT token
  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return { userId: decoded.userId }
    } catch (error) {
      return null
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Register user with email/password
  async registerWithEmail(userData: CreateUserData & { password: string }): Promise<AuthResponse> {
    const { email, name, password } = userData

    // Check if user already exists
    if (usersByEmail.has(email)) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user = {
      id: userId,
      email,
      name,
      password_hash: hashedPassword,
      provider: 'email',
      provider_id: null,
      email_verified: false,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }

    // Store user
    users.set(userId, user)
    usersByEmail.set(email, user)

    // Generate tokens
    const tokens = this.generateTokens(userId)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        provider_id: user.provider_id,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login
      },
      tokens
    }
  }

  // Login with email/password
  async loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    // Get user
    const user = usersByEmail.get(email)
    if (!user || user.provider !== 'email') {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Update last login
    user.last_login = new Date().toISOString()

    // Generate tokens
    const tokens = this.generateTokens(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        provider_id: user.provider_id,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login
      },
      tokens
    }
  }

  // Login/Register with Google OAuth
  async loginWithGoogle(googleUser: any): Promise<AuthResponse> {
    const { sub: providerId, email, name, picture: avatar_url } = googleUser

    if (!email) {
      throw new Error('No email found in Google account')
    }

    // Check if user exists
    let user = usersByEmail.get(email)

    if (user) {
      // Update existing user
      user.name = name || user.name
      user.provider_id = providerId
      user.avatar_url = avatar_url || user.avatar_url
      user.updated_at = new Date().toISOString()
      user.last_login = new Date().toISOString()
    } else {
      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      user = {
        id: userId,
        email: email,
        name: name || 'Google User',
        password_hash: null,
        provider: 'google',
        provider_id: providerId,
        avatar_url: avatar_url,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }

      // Store user
      users.set(userId, user)
      usersByEmail.set(email, user)
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        provider_id: user.provider_id,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login
      },
      tokens
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const user = users.get(userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      provider: user.provider,
      provider_id: user.provider_id,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    }
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    const user = users.get(userId)
    if (user) {
      user.last_login = new Date().toISOString()
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token')
      }

      // Generate new tokens
      return this.generateTokens(decoded.userId)
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // Logout (blacklist token - in production, use Redis for token blacklisting)
  async logout(token: string): Promise<void> {
    // In production, add token to blacklist in Redis
    // For now, tokens will expire naturally
  }

  // Send password reset email (placeholder)
  async sendPasswordResetEmail(email: string): Promise<void> {
    // Check if user exists (don't reveal if user exists or not)
    console.log(`Password reset email would be sent to: ${email}`)
  }

  // Reset password (placeholder)
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In production, verify reset token and update password
    throw new Error('Password reset not implemented yet')
  }
}
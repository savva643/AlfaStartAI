import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../../shared/db/index.js'
import { config } from '../../app/config/index.js'
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/index.js'
import type { RegisterInput, LoginInput } from './auth.schema.js'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    const hashedPassword = hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        businessName: input.businessName,
        businessType: input.businessType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const tokens = this.generateTokens(user.id, user.email)

    return { user, ...tokens }
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValidPassword = verifyPassword(input.password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const tokens = this.generateTokens(user.id, user.email)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        businessType: user.businessType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...tokens,
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessType: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    })
    const refreshToken = jwt.sign({ userId, email }, config.JWT_SECRET, {
      expiresIn: '30d',
    })

    return { accessToken, refreshToken }
  }

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string }
    } catch {
      throw new UnauthorizedError('Invalid or expired token')
    }
  }
}

export const authService = new AuthService()

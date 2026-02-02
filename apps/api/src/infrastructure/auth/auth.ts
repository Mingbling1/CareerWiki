import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'empliq-dev-secret-key-change-in-production-32chars',
  
  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  
  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  
  // Account linking configuration - allow linking accounts with same email
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'credential'],
    },
  },
  
  // Advanced cookie settings for cross-origin OAuth
  advanced: {
    cookies: {
      session: {
        attributes: {
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  
  // User configuration
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },
  
  // Trusted origins for CORS
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

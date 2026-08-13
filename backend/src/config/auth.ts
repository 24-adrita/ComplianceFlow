import { betterAuth } from 'better-auth';
import { bearer, jwt, admin } from 'better-auth/plugins';
import mongoose from 'mongoose';
import { env } from './env.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';

/**
 * Better Auth Server-Side Instance Configuration
 * Manages Authentication, Session Cookies, Bearer / JWT Tokens, Password Hashing, and Role-Based Access Control (RBAC).
 */
export const auth = betterAuth({
  appName: 'ComplianceFlow',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // MongoDB Connection Adapter via Mongoose Connection Instance
  database: mongoose.connection.db
    ? {
        db: mongoose.connection.db,
        type: 'mongodb' as const,
      }
    : undefined,

  // Email and Password Credential Authentication Strategy
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },

  // State-of-the-Art Session Management Strategy
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Days Total Session Lifespan
    updateAge: 60 * 60 * 24, // 24 Hours Rolling Session Refresh Threshold
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 Minutes Local Cookie Cache
    },
    freshAge: 60 * 60, // 1 Hour Freshness Window for High-Security Operations
  },

  // Extended User Schema Fields for Multi-Tenant Role Based Access Control
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: UserRole.EMPLOYEE,
      },
      companyId: {
        type: 'string',
        required: false,
      },
      departmentId: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      phoneNumber: {
        type: 'string',
        required: false,
      },
      isMfaEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },

  // Modular Better Auth Security Plugins
  plugins: [
    // 1. Bearer Token Plugin - Extracts 'Authorization: Bearer <token>' for Mobile & REST API Clients
    bearer(),

    // 2. JWT Plugin - Issues signed JSON Web Tokens for stateless API Authorization
    jwt({
      jwt: {
        expirationTime: '7d',
      },
    }),

    // 3. Admin & RBAC Plugin - Provides Built-in Role Verification Infrastructure
    admin({
      defaultRole: UserRole.EMPLOYEE,
      adminRole: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    }),
  ],

  // Security, Cookie & Transmit Protocols
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
  },
});

export type AuthInstance = typeof auth;
export default auth;

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser } from '../common/types/express.types.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';
import { UserModel } from '../modules/user/user.model.js';
import auth from '../config/auth.js';

/**
 * Middleware to authenticate requests using Better Auth session or Bearer Token headers.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Try Better Auth session resolution
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      // Fallback: If Better Auth token direct check or session cookie
      if (!token) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Authentication token or session missing. Please log in.',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    const userId = session?.user?.id;

    // Retrieve database user profile for full role/tenant information
    let dbUser = null;
    if (userId) {
      dbUser = await UserModel.findById(userId);
    } else if (session?.user?.email) {
      dbUser = await UserModel.findOne({ email: session.user.email });
    }

    if (!dbUser) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authenticated user profile not found or has been removed.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.INACTIVE) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Your account is inactive or suspended. Contact your compliance administrator.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Populate Request Context
    const authUserPayload: AuthUser = {
      id: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      status: dbUser.status as UserStatus,
      companyId: dbUser.companyId ? dbUser.companyId.toString() : undefined,
      departmentId: dbUser.departmentId ? dbUser.departmentId.toString() : undefined,
      isMfaEnabled: dbUser.isMfaEnabled,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    req.user = authUserPayload;
    req.tenantId = authUserPayload.companyId;

    if (session?.session) {
      req.session = {
        id: session.session.id,
        userId: session.session.userId,
        token: session.session.token || token || '',
        expiresAt: new Date(session.session.expiresAt),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };
    }

    next();
  } catch (error) {
    console.error('❌ Authentication Middleware Failure:', error);
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Invalid or expired authentication session.',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Authorization Middleware: Grants access only if user has one of the allowed roles.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'User authentication context missing.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: `Forbidden. Role '${req.user.role}' lacks permission to access this resource.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

export default { authenticate, authorizeRoles };

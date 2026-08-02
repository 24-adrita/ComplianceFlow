import { Router } from 'express';
import DashboardController from './dashboard.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { dashboardOverviewQuerySchema } from './dashboard.validation.js';

const router = Router();

// Require authentication for all dashboard routes
router.use(authenticate);

/**
 * GET /api/v1/dashboard/overview
 * Dashboard Overview API (Cards, Health Score, Risk, Forecast, Charts, Recent Activity)
 */
router.get(
  '/overview',
  validateRequest(dashboardOverviewQuerySchema),
  DashboardController.getOverview
);

export default router;

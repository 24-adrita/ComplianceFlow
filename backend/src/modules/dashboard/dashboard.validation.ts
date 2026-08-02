import { z } from 'zod';

export const dashboardOverviewQuerySchema = z.object({
  query: z.object({
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
  }),
});

export type DashboardOverviewQueryInput = z.infer<typeof dashboardOverviewQuerySchema>['query'];

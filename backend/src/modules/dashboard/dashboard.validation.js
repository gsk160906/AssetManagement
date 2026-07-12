import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  range: z.enum(['today', '7d', '30d', '1y']).optional(),
});

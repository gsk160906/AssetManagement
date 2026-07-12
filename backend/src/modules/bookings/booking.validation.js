import { z } from 'zod';

export const createBookingSchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID'),
  startTime: z.string().datetime({ message: 'Invalid start time format' }),
  endTime: z.string().datetime({ message: 'Invalid end time format' }),
  purpose: z.string().min(3, 'Purpose must be at least 3 characters').max(255),
  notes: z.string().max(1000).optional().nullable()
});

export const updateBookingSchema = z.object({
  startTime: z.string().datetime({ message: 'Invalid start time format' }).optional(),
  endTime: z.string().datetime({ message: 'Invalid end time format' }).optional(),
  purpose: z.string().min(3).max(255).optional(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional()
});

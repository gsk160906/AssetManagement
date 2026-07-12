import * as service from './booking.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getBookings = asyncHandler(async (req, res) => {
  const filters = { ...req.query };
  // If role is employee, enforce retrieving only their own bookings
  if (req.user.role === 'EMPLOYEE') {
    filters.employeeId = req.user.id;
  }
  const result = await service.getBookings(filters);
  return successResponse(res, 'Bookings retrieved successfully', result, HTTP_STATUS.OK);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const filters = { ...req.query, employeeId: req.user.id };
  const result = await service.getBookings(filters);
  return successResponse(res, 'My bookings retrieved successfully', result, HTTP_STATUS.OK);
});

export const getBookingById = asyncHandler(async (req, res) => {
  const result = await service.getBookingById(req.params.id);
  
  // Access check for employee
  if (req.user.role === 'EMPLOYEE' && result.employee_id !== req.user.id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Access denied to others\' bookings.'
    });
  }

  // Department Head access check (can view department bookings)
  if (req.user.role === 'DEPARTMENT_HEAD' && req.user.department_id !== result.department_id) {
    // If they aren't the booking owner either
    if (result.employee_id !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Department Heads can only view bookings within their department.'
      });
    }
  }

  return successResponse(res, 'Booking details retrieved', result, HTTP_STATUS.OK);
});

export const getAvailableResources = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Both start and end timestamps are required.'
    });
  }
  const result = await service.getAvailableResources(start, end);
  return successResponse(res, 'Available resources retrieved', { resources: result }, HTTP_STATUS.OK);
});

export const getBookingStats = asyncHandler(async (req, res) => {
  const result = await service.getBookingStats();
  return successResponse(res, 'Booking statistics retrieved', result, HTTP_STATUS.OK);
});

export const getCalendarEvents = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.user.role === 'EMPLOYEE') {
    filters.employeeId = req.user.id;
  }
  const result = await service.getCalendarEvents(filters);
  return successResponse(res, 'Calendar events retrieved', { events: result }, HTTP_STATUS.OK);
});

export const createBooking = asyncHandler(async (req, res) => {
  const result = await service.createBooking(req.user, req.body);
  return successResponse(res, 'Booking created successfully.', result, HTTP_STATUS.CREATED);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const result = await service.updateBooking(req.user, req.params.id, req.body);
  return successResponse(res, 'Booking updated successfully.', result, HTTP_STATUS.OK);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  await service.cancelBooking(req.user, req.params.id);
  return successResponse(res, 'Booking cancelled successfully.', null, HTTP_STATUS.OK);
});

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import { errorResponse } from '../utils/response.js';

export const notFound = (req, res, next) => {
  errorResponse(res, MESSAGES.ROUTE_NOT_FOUND, { path: req.originalUrl }, HTTP_STATUS.NOT_FOUND);
};
export default notFound;

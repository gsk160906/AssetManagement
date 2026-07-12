export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body || schema.query || schema.params) {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;

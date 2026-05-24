const { AppError } = require('../utils/errors');

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message
  }));
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Validation error', formatZodIssues(result.error.issues)));
    }
    req.body = result.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new AppError(400, 'Validation error', formatZodIssues(result.error.issues)));
    }
    req.params = result.data;
    return next();
  };
}

module.exports = { validateBody, validateParams };

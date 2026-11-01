export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // In production, never leak internal stack traces or database schema errors
  const isDev = process.env.NODE_ENV === 'development';

  // Sanitize message to prevent leaking internal database connection strings or keys
  let safeMessage = err.message || 'Internal Server Error';
  if (safeMessage.includes('password') || safeMessage.includes('key') || safeMessage.includes('postgres://')) {
    safeMessage = 'A secure transaction error occurred.';
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(isDev && { stack: err.stack }),
  });
};

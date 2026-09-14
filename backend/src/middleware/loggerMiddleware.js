export function logger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}

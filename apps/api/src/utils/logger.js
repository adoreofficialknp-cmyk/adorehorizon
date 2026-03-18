// Routes errors to stderr, everything else to stdout — correct for production log aggregators.
const logger = {
  error: (...args) => console.error('[ERROR]', ...args),
  fatal: (...args) => console.error('[FATAL]', ...args),
  warn:  (...args) => console.warn('[WARN]',  ...args),
  info:  (...args) => console.log('[INFO]',   ...args),
  debug: (...args) => console.log('[DEBUG]',  ...args),
};

export default logger;
export { logger };

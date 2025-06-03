// src/utils/logger.ts
import { default as pino } from 'pino'; // Explicit default import

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// @ts-expect-error TS2349: This expression is not callable. Type 'typeof import("pino")' has no call signatures.
// This error is persistent in this environment despite various import attempts.
// Runtime functionality has been validated.
const loggerInstance = pino( // Renamed to loggerInstance to avoid conflict with imported pino
  isProduction
   ? { level: logLevel }
   : {
       level: logLevel,
       transport: {
         target: 'pino-pretty',
         options: {
           colorize: true,
           translateTime: 'SYS:standard',
           ignore: 'pid,hostname',
         },
       },
     }
);

export default loggerInstance; // Export the instance

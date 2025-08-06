import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // JWT Configuration
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m', // Short-lived access token
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d', // Longer-lived refresh token
    },
  },
  
  // Password Configuration
  password: {
    saltRounds: 12, // Increased from 10 for better security
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // Rate Limiting
  rateLimit: {
    ttl: 60, // 1 minute
    limit: 5, // 5 requests per minute
  },
  
  // Session Configuration
  session: {
    maxConcurrentSessions: 3, // Maximum number of concurrent sessions per user
  },
})); 
import { ConfigService } from '@nestjs/config';


export const getCorsConfig = (configService: ConfigService) => {

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  
  if (nodeEnv === 'production') {
    return {
      origin: [
        'https://your-domain.com',
        'https://www.your-domain.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  // Development CORS - allow all
  return {
    origin: '*',
    credentials: true,
  };
};
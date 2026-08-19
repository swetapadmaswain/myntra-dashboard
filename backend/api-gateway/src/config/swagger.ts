/**
 * Swagger / OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';
import settings from './settings';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wishlist AI Discovery Engine - API Gateway',
      version: settings.appVersion,
      description:
        'API Gateway providing authenticated, rate-limited, and cached access to the ' +
        'Data Ingestion, NLP, and Analytics microservices.',
    },
    servers: [
      {
        url: `http://localhost:${settings.port}/api/v1`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Service health and dependency checks' },
      { name: 'Dashboard', description: 'Aggregated analytics dashboard endpoints' },
      { name: 'Snippets', description: 'Conversation snippet listing and search' },
      { name: 'Analytics', description: 'Segments and trend analytics' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

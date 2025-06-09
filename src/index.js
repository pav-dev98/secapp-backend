const express = require('express');
const http = require('http');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { setupSocketIO } = require('./socket');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Secure App API',
    version: '1.0.0',
    description: 'API documentation for the Secure App application',
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: 'Development server',
    },
    {
      url: `http://192.168.1.10:${PORT}/api/v1`,
      description: 'Production server',
    }
  ],
  components: { 
    securitySchemes: {
      bearerAuth: { 
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    },
    schemas: {} 
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Message routes
const messageRoutes = require('./routes/message');
app.use('/api/v1', messageRoutes);

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// Incident routes
const incidentRoutes = require('./routes/incident');
app.use('/api/v1/incidents', incidentRoutes);

// Emergency Contact routes
const emergencyContactRoutes = require('./routes/emergency-contact');
app.use('/api/v1/emergency-contacts', emergencyContactRoutes);

// User routes
const userRoutes = require('./routes/user');
app.use('/api/v1/users', userRoutes);

// Socket.io
const server = http.createServer(app);
setupSocketIO(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

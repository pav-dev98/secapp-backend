const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

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

// Message routes
const messageRoutes = require('./routes/message');
app.use('/api/v1', messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

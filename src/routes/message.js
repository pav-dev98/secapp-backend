const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validación básica
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Crear el mensaje en la base de datos
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: newMessage
    });

  } catch (error) {
    console.error('Error al procesar el mensaje:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el mensaje'
    });
  }
});
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany();
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los mensajes'
    });
  }
});

module.exports = router;

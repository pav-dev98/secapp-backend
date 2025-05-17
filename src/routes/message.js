const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID del mensaje.
 *         name:
 *           type: string
 *           description: Nombre del remitente.
 *         email:
 *           type: string
 *           format: email
 *           description: Email del remitente.
 *         subject:
 *           type: string
 *           description: Asunto del mensaje.
 *         message:
 *           type: string
 *           description: Contenido del mensaje.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del mensaje.
 *       example:
 *         id: "clzyx98760000mlkjihgfedcba"
 *         name: "Jane Doe"
 *         email: "jane.doe@example.com"
 *         subject: "Consulta sobre el producto X"
 *         message: "Hola, me gustaría saber más sobre..."
 *         createdAt: "2023-10-27T12:00:00.000Z"
 *     NewMessage:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del remitente.
 *         email:
 *           type: string
 *           format: email
 *           description: Email del remitente.
 *         subject:
 *           type: string
 *           description: Asunto del mensaje.
 *         message:
 *           type: string
 *           description: Contenido del mensaje.
 *       example:
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         subject: "Interesado en sus servicios"
 *         message: "Me gustaría obtener una cotización."
 *     MessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Message'
 *       example:
 *         success: true
 *         message: "Mensaje enviado exitosamente"
 *         data:
 *           id: "clzyx98760000mlkjihgfedcba"
 *           name: "John Doe"
 *           email: "john.doe@example.com"
 *           subject: "Interesado en sus servicios"
 *           message: "Me gustaría obtener una cotización."
 *           createdAt: "2023-10-27T12:05:00.000Z"
 *     MessageListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *       example:
 *         success: true
 *         data:
 *           - id: "clzyx98760000mlkjihgfedcba"
 *             name: "Jane Doe"
 *             email: "jane.doe@example.com"
 *             subject: "Consulta sobre el producto X"
 *             message: "Hola, me gustaría saber más sobre..."
 *             createdAt: "2023-10-27T12:00:00.000Z"
 *           - id: "clzyx98770001mlkjihgfedcbb"
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             subject: "Interesado en sus servicios"
 *             message: "Me gustaría obtener una cotización."
 *             createdAt: "2023-10-27T12:05:00.000Z"
 * tags:
 *   name: Messages
 *   description: Operaciones relacionadas con mensajes de contacto.
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Envía un nuevo mensaje de contacto.
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMessage'
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Todos los campos son requeridos.
 *       500:
 *         description: Error al procesar el mensaje.
 */
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

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Obtiene todos los mensajes de contacto (requiere autenticación).
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: [] # Indica que este endpoint requiere autenticación JWT
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageListResponse'
 *       401:
 *         description: No autorizado (falta token o es inválido).
 *       500:
 *         description: Error al obtener los mensajes.
 */
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

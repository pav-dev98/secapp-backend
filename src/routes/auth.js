// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; // Necesitaremos añadir esto a .env

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario.
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario.
 *       example:
 *         email: user@example.com
 *         password: password123
 *     UserRegister:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email para el nuevo usuario.
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña para el nuevo usuario (mínimo 8 caracteres).
 *       example:
 *         email: newuser@example.com
 *         password: newpassword123
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT de autenticación.
 *       example:
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbG...
 *     UserRegistered:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Usuario registrado exitosamente
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: ID del usuario creado.
 *             email:
 *               type: string
 *               format: email
 *               description: Email del usuario creado.
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Fecha de creación del usuario.
 *           example:
 *             id: "clxyz12340000abcdefghij"
 *             email: "newuser@example.com"
 *             createdAt: "2023-10-27T10:30:00.000Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Ruta de Login (POST /api/v1/auth/login)
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario existente.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Email y contraseña son requeridos.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/login', async (req, res) => {

  const { email, password } = req.body;
  console.log(email, password,"email y password");

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // 1. Buscar al usuario por email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); // Email no encontrado
    }

    // 2. Comparar la contraseña proporcionada con el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); // Contraseña incorrecta
    }

    // 3. Generar el JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload del token
      JWT_SECRET,                             // Clave secreta
      { expiresIn: '1h' }                     // Opciones (ej: expira en 1 hora)
    );

    // 4. Enviar el token al cliente
    console.log(user,"user");
    res.json({ user:user,accessToken:token });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de Registro (POST /api/v1/auth/register)
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegistered'
 *       400:
 *         description: Datos de entrada inválidos (email/contraseña requeridos o contraseña corta).
 *       409:
 *         description: El email ya está registrado.
 *       500:
 *         description: Error interno del servidor al registrar usuario.
 */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Validación básica de contraseña (ej: longitud mínima)
  if (password.length < 8) {
     return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    // 1. Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' }); // 409 Conflict
    }

    // 2. Hashear la contraseña
    const saltRounds = 10; // Factor de coste para bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 4. Responder (excluyendo la contraseña)
    // Podrías también generar y enviar un JWT aquí si quieres loguear al usuario inmediatamente
    res.status(201).json({ // 201 Created
        message: 'Usuario registrado exitosamente',
        user: {
            id: newUser.id,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
     });

  } catch (error) {
    console.error('Error en registro:', error);
    // Considerar manejo específico para errores de base de datos (ej. PrismaClientKnownRequestError)
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
});

module.exports = router;

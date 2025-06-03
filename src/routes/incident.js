const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Incident:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la incidencia
 *         type:
 *           type: string
 *           description: Tipo de incidencia
 *         description:
 *           type: string
 *           description: Descripción detallada de la incidencia
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
 *           description: Estado actual de la incidencia
 *         userId:
 *           type: integer
 *           description: ID del usuario que reportó la incidencia
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la incidencia
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     NewIncident:
 *       type: object
 *       required:
 *         - type
 *         - description
 *         - userId
 *       properties:
 *         type:
 *           type: string
 *           description: Tipo de incidencia
 *         description:
 *           type: string
 *           description: Descripción detallada de la incidencia
 *         userId:
 *           type: integer
 *           description: ID del usuario que reporta la incidencia
 */

/**
 * @swagger
 * /incidents:
 *   get:
 *     summary: Obtiene todas las incidencias
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 */
router.get('/', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las incidencias' });
  }
});

/**
 * @swagger
 * /incidents/{id}:
 *   get:
 *     summary: Obtiene una incidencia por ID
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la incidencia
 *     responses:
 *       200:
 *         description: Incidencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       404:
 *         description: Incidencia no encontrada
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    if (!incident) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la incidencia' });
  }
});

/**
 * @swagger
 * /incidents:
 *   post:
 *     summary: Crea una nueva incidencia
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewIncident'
 *     responses:
 *       201:
 *         description: Incidencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', async (req, res) => {
  const { type, description, userId } = req.body;
  
  // Validación básica
  if (!type || !description || !userId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const newIncident = await prisma.incident.create({
      data: {
        type,
        description,
        userId: Number(userId),
      },
    });
    res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error al crear la incidencia:', error);
    res.status(500).json({ error: 'Error al crear la incidencia' });
  }
});

/**
 * @swagger
 * /incidents/{id}:
 *   put:
 *     summary: Actualiza una incidencia existente
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la incidencia a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
 *     responses:
 *       200:
 *         description: Incidencia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       404:
 *         description: Incidencia no encontrada
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, description, status } = req.body;

  try {
    const updatedIncident = await prisma.incident.update({
      where: { id: Number(id) },
      data: {
        ...(type && { type }),
        ...(description && { description }),
        ...(status && { status }),
      },
    });
    res.json(updatedIncident);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar la incidencia' });
  }
});

/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     summary: Elimina una incidencia
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la incidencia a eliminar
 *     responses:
 *       204:
 *         description: Incidencia eliminada exitosamente
 *       404:
 *         description: Incidencia no encontrada
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.incident.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    res.status(500).json({ error: 'Error al eliminar la incidencia' });
  }
});

module.exports = router;

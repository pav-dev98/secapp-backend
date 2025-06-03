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
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitud de la ubicación de la incidencia
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitud de la ubicación de la incidencia
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
 *         - tipoIncidencia
 *         - descripcion
 *         - ubicacion
 *       properties:
 *         tipoIncidencia:
 *           type: string
 *           description: Tipo de incidencia
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la incidencia
 *         ubicacion:
 *           type: object
 *           required:
 *             - lat
 *             - lng
 *           properties:
 *             lat:
 *               type: number
 *               format: float
 *               example: -9.299509131491826
 *             lng:
 *               type: number
 *               format: float
 *               example: -75.99846752086636
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
  const { tipoIncidencia, descripcion, ubicacion, userId } = req.body;
  
  // Validación básica
  if (!tipoIncidencia || !descripcion || !ubicacion || !ubicacion.lat || !ubicacion.lng || !userId) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: tipoIncidencia, descripcion, ubicacion {lat, lng}, userId' 
    });
  }

  try {
    const newIncident = await prisma.incident.create({
      data: {
        type: tipoIncidencia,
        description: descripcion,
        latitude: parseFloat(ubicacion.lat),
        longitude: parseFloat(ubicacion.lng),
        userId: Number(userId),
      },
    });
    res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error al crear la incidencia:', error);
    res.status(500).json({ error: 'Error al crear la incidencia', details: error.message });
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
 *               tipoIncidencia:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: float
 *                   lng:
 *                     type: number
 *                     format: float
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
  const { tipoIncidencia, descripcion, status, ubicacion } = req.body;

  try {
    const updateData = {};
    
    if (tipoIncidencia) updateData.type = tipoIncidencia;
    if (descripcion) updateData.description = descripcion;
    if (status) updateData.status = status;
    
    if (ubicacion) {
      if (ubicacion.lat !== undefined) updateData.latitude = parseFloat(ubicacion.lat);
      if (ubicacion.lng !== undefined) updateData.longitude = parseFloat(ubicacion.lng);
    }

    const updatedIncident = await prisma.incident.update({
      where: { id: Number(id) },
      data: updateData,
    });
    
    res.json(updatedIncident);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    console.error('Error al actualizar la incidencia:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la incidencia',
      details: error.message 
    });
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

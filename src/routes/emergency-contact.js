const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);
// Obtener todos los contactos de emergencia del usuario
/**
 * @swagger
 * /emergency-contacts:
 *   get:
 *     summary: Obtener todos los contactos de emergencia del usuario
 *     security:
 *       - bearerAuth: []
 *     tags: [Emergency Contacts]
 *     responses:
 *       200:
 *         description: Lista de contactos de emergencia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {

  // const userId = req.body.userId;
  // obtenemos el userId del token
  const userId = req.user.id;
  try {
    const emergencyContacts = await prisma.emergencyContact.findMany({
      where: {
        userId: userId
      },
      select: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            notify: true
          }
        }
      }
    });
    console.log(emergencyContacts,"emergencyContacts");
    res.json(emergencyContacts.map(contact => contact.contact));
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar un nuevo contacto de emergencia
/**
 * @swagger
 * /emergency-contacts:
 *   post:
 *     summary: Agregar un nuevo contacto de emergencia
 *     security:
 *       - bearerAuth: []
 *     tags: [Emergency Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: integer
 *                 description: ID del usuario que será el contacto de emergencia
 *             required:
 *               - contactId
 *     responses:
 *       201:
 *         description: Contacto de emergencia agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyContact'
 *       400:
 *         description: Contacto ya existe o datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', async (req, res) => {
  console.log("llega a emergency-contact")
  const userId = req.body.userId;
  try {
    const { contactId } = req.body;

    // Verificar si el contacto ya existe
    const existingContact = await prisma.emergencyContact.findFirst({
      where: {
        userId: userId,
        contactId: contactId
      }
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Este contacto ya existe' });
    }

    const emergencyContact = await prisma.emergencyContact.create({
      data: {
        userId: userId,
        contactId: contactId
      }
    });

    res.status(201).json(emergencyContact);
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un contacto de emergencia
/**
 * @swagger
 * /emergency-contacts/{contactId}:
 *   delete:
 *     summary: Eliminar un contacto de emergencia
 *     security:
 *       - bearerAuth: []
 *     tags: [Emergency Contacts]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto de emergencia a eliminar
 *     responses:
 *       204:
 *         description: Contacto de emergencia eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;

    const deletedContact = await prisma.emergencyContact.delete({
      where: {
        userId_contactId: {
          userId: req.user.id,
          contactId: parseInt(contactId)
        }
      }
    });

    if (!deletedContact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

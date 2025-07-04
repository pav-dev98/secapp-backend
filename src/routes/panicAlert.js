const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.post('/', async (req, res) => {
    console.log("esta llegando al backend");
    try {
        const userId = req.user.userId;
        const emergencyContacts = await prisma.emergencyContact.findMany({
            where: {
                userId: userId
            },
            select: {
                user:{
                    select:{
                        name:true,
                        phone:true,
                    }
                },
                contact: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                }
            }
        });
        const notifications = await prisma.notification.createMany({
            data: emergencyContacts.map(emergencyContact => ({
                recipientId: emergencyContact.contact.id,
                senderId: userId,
                type: 'PANIC_ALERT',
                message: `a activado una alerta de pánico comunicate con el para saber si se encuentra bien.`,
                isRead: false
            }))
        });
        console.log("notifications creadas",notifications)
        res.status(200).json({ message: 'Panic alert sent successfully' });
    } catch (error) {
        console.log("hubo un error en panic Alert")
    }
  });

module.exports = router;
    
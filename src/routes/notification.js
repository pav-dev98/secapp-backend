const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/', async (req, res) => {
    console.log("esto esta llegando al backend de notifications");
    try {
        const userId = req.user.userId;
        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: userId
            },
            include:{
                sender:{
                    select:{
                        name:true,
                        phone:true,
                    }
                },
            }
        });
        console.log("notifications desde el backend",notifications)
        res.status(200).json(notifications);
    } catch (error) {
        console.log("hubo un error en get notifications")
    }
});

module.exports = router;
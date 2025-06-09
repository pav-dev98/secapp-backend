// socket.js
const { Server } = require('socket.io');

let io;

function setupSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // tu frontend
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Usuario conectado:', socket.id);

    // Escuchar eventos personalizados si los necesitas
    socket.on('disconnect', () => {
      console.log('❌ Usuario desconectado:', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io no está inicializado aún');
  return io;
}

module.exports = {
  setupSocketIO,
  getIO,
};

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 1. Inicializamos la aplicación
const app = express();
app.use(cors()); // evita bloqueos de seguridad al conectar el frontend

// 2. Creamos el servidor HTTP
const server = http.createServer(app);

// 3. Configura los Sockets (El tiempo real)
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier frontend
    methods: ["GET", "POST"]
  }
});

// 4. Lógica de los Sockets (Qué pasa cuando alguien entra al chat)
io.on('connection', (socket) => {
  console.log(`🟢 Un usuario se ha conectado. ID: ${socket.id}`);

  // Cuando el servidor recibe un mensaje llamado 'chat message'
  socket.on('chat message', (data) => {
    console.log(`Mensaje recibido de ${data.usuario}: ${data.texto}`);
    
    // Inmediatamente se lo re-enviamos a TODOS los usuarios conectados
    io.emit('chat message', data);
  });

  // Cuando alguien cierra la pestaña
  socket.on('disconnect', () => {
    console.log('🔴 Un usuario se ha desconectado');
  });
});

// 5. Enciende el motor en el puerto 3000
server.listen(3000, () => {
  console.log('🚀 Servidor backend corriendo perfectamente en http://localhost:3000');
});
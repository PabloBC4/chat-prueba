const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose'); // Importa Mongoose para la base de datos

// 1. Inicializa la aplicación
const app = express();
app.use(cors()); // evita bloqueos de seguridad al conectar el frontend

// 2. Configura la Base de Datos (MongoDB)
const MONGO_URL = 'https://chat-prueba-qe4a.onrender.com';
mongoose.connect(MONGO_URL)
  .then(() => console.log('📦 Base de datos conectada'))
  .catch(err => console.error('Error conectando a la BD:', err));

// Define el "molde" (esquema) de los mensajes
const mensajeSchema = new mongoose.Schema({
  usuario: String,
  texto: String,
  fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// 3. Crea el servidor HTTP
const server = http.createServer(app);

// 4. Configura los Sockets (El tiempo real)
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier frontend
    methods: ["GET", "POST"]
  }
});

// 5. Lógica de los Sockets (Qué pasa cuando alguien entra al chat)
io.on('connection', async (socket) => {
  console.log(`🟢 Un usuario se ha conectado. ID: ${socket.id}`);

  // Al conectar, enviamos los últimos 50 mensajes de la base de datos
  try {
    const historial = await Mensaje.find().sort({ fecha: 1 }).limit(50);
    socket.emit('historial', historial);
  } catch (err) { console.log("Error al cargar historial:", err); }

  // Cuando el servidor recibe un mensaje llamado 'chat message'
  socket.on('chat message', async (data) => {
    console.log(`Mensaje recibido de ${data.usuario}: ${data.texto}`);
    
    // Guardamos el mensaje en la base de datos
    const nuevoMensaje = new Mensaje({ usuario: data.usuario, texto: data.texto });
    await nuevoMensaje.save();
    
    // Inmediatamente se lo re-enviam a TODOS los usuarios conectados
    io.emit('chat message', data);
  });

  // Cuando alguien cierra la pestaña
  socket.on('disconnect', () => {
    console.log('🔴 Un usuario se ha desconectado');
  });
});

// 6. Enciende el motor en el puerto 3000
server.listen(3000, () => {
  console.log('🚀 Servidor backend corriendo perfectamente en http://localhost:3000');
});
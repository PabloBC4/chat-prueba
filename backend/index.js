const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// --- CONFIGURACIÓN MONGO ---
const MONGO_URL = 'mongodb+srv://pabloberberc_db_user:nkc4n85rSkn5nXRt@cluster0.de4qwxu.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URL)
  .then(() => console.log('📦 Base de datos conectada'))
  .catch(err => console.error('Error BD:', err));

const mensajeSchema = new mongoose.Schema({
  usuario: String,
  texto: String,
  fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', async (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.id}`);

  // Cargar historial al entrar
  try {
    const historial = await Mensaje.find().sort({ fecha: 1 }).limit(50);
    socket.emit('historial', historial);
  } catch (err) { console.log(err); }

  socket.on('chat message', async (data) => {
    const nuevoMensaje = new Mensaje({ usuario: data.usuario, texto: data.texto });
    await nuevoMensaje.save(); // ¡Aquí se guarda!
    io.emit('chat message', data);
  });
});

server.listen(3000, () => console.log('🚀 Servidor arriba en puerto 3000'));
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// 1. Conecta al servidor Backend
const socket = io('https://chat-prueba-qe4a.onrender.com');

function App() {
  const [nombre, setNombre] = useState('');
  const [registrado, setRegistrado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const mensajesEndRef = useRef(null);

  // 2. Efecto para escuchar los mensajes que llegan del servidor
  useEffect(() => {
    socket.on('chat message', (data) => {
      setMensajes((mensajesPrevios) => [...mensajesPrevios, data]);
    });

    socket.on('historial', (mensajesGuardados) => {
      setMensajes(mensajesGuardados); // Carga el historial al entrar
    });

    return () => {
      socket.off('chat message');
      socket.off('historial');
    };
  }, []);

  // 3. Efecto para auto-scroll
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 4. Funciones
  const entrarChat = (e) => {
    e.preventDefault();
    if (nombre.trim() !== '') setRegistrado(true);
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (mensaje.trim() !== '') {
      socket.emit('chat message', { usuario: nombre, texto: mensaje });
      setMensaje('');
    }
  };

  if (!registrado) {
    return (
      <div className="login-container">
        <h2>Bienvenido al Chat</h2>
        <form onSubmit={entrarChat}>
          <input type="text" placeholder="Tu nombre..." value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header"><h2>Sala de Chat</h2></div>
      <div className="chat-messages">
        {mensajes.map((msg, index) => (
          <div key={index} className={`message ${msg.usuario === nombre ? 'my-message' : 'other-message'}`}>
            <strong>{msg.usuario}: </strong><span>{msg.texto}</span>
          </div>
        ))}
        <div ref={mensajesEndRef} />
      </div>
      <form className="chat-form" onSubmit={enviarMensaje}>
        <input type="text" placeholder="Escribe..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} required />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default App;
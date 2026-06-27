import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css'; // Aquí cargaremos los estilos estéticos

// 1. Nos conectamos al servidor Backend (el que está en el puerto 3000)
const socket = io('https://chat-prueba-qe4a.onrender.com');

function App() {
  // Estados para controlar la información
  const [nombre, setNombre] = useState('');
  const [registrado, setRegistrado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  
  // Referencia para hacer auto-scroll al último mensaje
  const mensajesEndRef = useRef(null);

  // 2. Efecto para escuchar los mensajes que llegan del servidor
  useEffect(() => {
    socket.on('chat message', (data) => {
      // Cuando llega un mensaje, lo agregamos a nuestra lista
      setMensajes((mensajesPrevios) => [...mensajesPrevios, data]);
    });

    return () => {
      socket.off('chat message'); // Limpieza al salir
    };
  }, []);

  // 3. Efecto para bajar automáticamente el scroll cuando llega un mensaje nuevo
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 4. Funciones de los botones
  const entrarChat = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (nombre.trim() !== '') {
      setRegistrado(true);
    }
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (mensaje.trim() !== '') {
      // Emitimos el mensaje hacia el backend
      socket.emit('chat message', { usuario: nombre, texto: mensaje });
      setMensaje(''); // Limpiamos la caja de texto
    }
  };

  // 5. PANTALLA DE INGRESO (Si no está registrado)
  if (!registrado) {
    return (
      <div className="login-container">
        <h2>Bienvenido al Chat</h2>
        <p>Ingresa un nombre para comenzar</p>
        <form onSubmit={entrarChat}>
          <input
            type="text"
            placeholder="Tu nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  // 6. PANTALLA PRINCIPAL DEL CHAT
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Sala de Chat</h2>
        <span>👤 {nombre}</span>
      </div>
      
      <div className="chat-messages">
        {mensajes.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.usuario === nombre ? 'my-message' : 'other-message'}`}
          >
            <strong>{msg.usuario}: </strong>
            <span>{msg.texto}</span>
          </div>
        ))}
        <div ref={mensajesEndRef} />
      </div>

      <form className="chat-form" onSubmit={enviarMensaje}>
        <input
          type="text"
          placeholder="Escribe tu mensaje aquí..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default App;
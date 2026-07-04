import "./ChatRoom.css";
import { ArrowLeft, Send, CheckCircle, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../config";

function Estrellas({ valor, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={24}
          fill={i <= valor ? "#facc15" : "none"}
          color={i <= valor ? "#facc15" : "#aaa"}
          style={{ cursor: onChange ? "pointer" : "default" }}
          onClick={() => onChange && onChange(i)}
        />
      ))}
    </div>
  );
}

function ChatRoom() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [modalRechazo, setModalRechazo] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [enviandoRechazo, setEnviandoRechazo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [miId, setMiId] = useState(null);
  const [miRol, setMiRol] = useState(null);
  const [otroId, setOtroId] = useState(null);
  const [nombreOtro, setNombreOtro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [workerCompleto, setWorkerCompleto] = useState(false);
  const [clientCompleto, setClientCompleto] = useState(false);
  const [publicacionEstado, setPublicacionEstado] = useState("");
  const [publicacionTitulo, setPublicacionTitulo] = useState("");
  const [modalValoracion, setModalValoracion] = useState(false);
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [toast, setToast] = useState("");

  const [valoracion, setValoracion] = useState({
    atencion: 0,
    trabajo: 0,
    hospitalidad: 0,
    comentario: "",
  });

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("access");

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchMensajes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats/${id}/mensajes/`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.mensajes);
      setMiId(data.mi_id);
      setMiRol(data.mi_rol);
      setOtroId(data.otro_id);
      setNombreOtro(data.nombre_otro);
      setWorkerCompleto(data.worker_completo);
      setClientCompleto(data.client_completo);
      setPublicacionEstado(data.publicacion_estado);
      setPublicacionTitulo(data.publicacion_titulo);
    } catch (err) {
      console.error("Error al cargar mensajes", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/chats/${id}/mensajes/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: newMessage }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error al enviar mensaje", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const enviarValoracion = async () => {
    if (!valoracion.atencion || !valoracion.trabajo || !valoracion.hospitalidad) {
      mostrarToast("Completá todas las valoraciones");
      return;
    }

    setEnviandoValoracion(true);
    const endpoint = miRol === 'worker'
      ? `${API_URL}/api/chats/${id}/completar/worker/`
      : `${API_URL}/api/chats/${id}/completar/client/`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valoracion),
    });

    const data = await res.json();

    if (res.ok) {
      mostrarToast(data.mensaje);
      setModalValoracion(false);
      fetchMensajes();
    } else {
      mostrarToast(data.error || "Error al enviar valoración");
    }
    setEnviandoValoracion(false);
  };

  // Determinar si mostrar botón de completar
  const puedeCompletar = () => {
    if (publicacionEstado === 'completada') return false;
    if (miRol === 'worker' && !workerCompleto) return true;
    if (miRol === 'client' && workerCompleto && !clientCompleto) return true;
    return false;
  };

  const textoBoton = () => {
    if (miRol === 'worker') return "Marcar trabajo como completado";
    if (miRol === 'client' && workerCompleto) return "Confirmar finalización";
    return null;
  };

  const rechazarFinalizacion = async () => {
  if (!justificacion.trim()) {
    mostrarToast("Escribí una justificación");
    return;
  }
  setEnviandoRechazo(true);
  const res = await fetch(`${API_URL}/api/chats/${id}/rechazar-finalizacion/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ justificacion }),
  });

  const data = await res.json();
  if (res.ok) {
    mostrarToast(data.mensaje);
    setModalRechazo(false);
    setJustificacion("");
    fetchMensajes();
  } else {
    mostrarToast(data.error || "Error al enviar");
  }
  setEnviandoRechazo(false);
};
  return (
    <div className="chat-room">

      <div className="room-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/perfil/usuario/${otroId}`)}
        >
          <strong>{nombreOtro || "Chat"}</strong>
          <p>{publicacionTitulo}</p>
        </div>
        {publicacionEstado === 'completada' && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#4ecf63", fontSize: 12, fontWeight: 600 }}>
            <CheckCircle size={14} /> Completado
          </div>
        )}
      </div>

      {/* BANNER ESTADO */}
      {publicacionEstado === 'en_proceso' && workerCompleto && !clientCompleto && miRol === 'client' && (
        <div className="cr-banner cr-banner--warning">
          <span>El trabajador marcó el trabajo como completado. ¿Confirmás la finalización?</span>
          <button className="cr-rechazar-link" onClick={() => setModalRechazo(true)}>
            No está finalizado
          </button>
        </div>
      
      )}
      {publicacionEstado === 'en_proceso' && workerCompleto && miRol === 'worker' && (
        <div className="cr-banner cr-banner--info">
          Esperando confirmación del cliente...
        </div>
      )}

      <div className="messages">
        {cargando && <p style={{ textAlign: "center", color: "#999" }}>Cargando mensajes...</p>}
        {!cargando && messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#999" }}>No hay mensajes todavía</p>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={msg.senderId === miId ? "message sent" : "message received"}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTÓN COMPLETAR */}
      {puedeCompletar() && (
        <div className="cr-completar-bar">
          <button className="cr-completar-btn" onClick={() => setModalValoracion(true)}>
            <CheckCircle size={16} /> {textoBoton()}
          </button>
        </div>
      )}

      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage}>
          <Send size={18} />
        </button>
      </div>

      {/* MODAL VALORACIÓN */}
      {modalValoracion && (
        <div className="cr-modal-overlay" onClick={() => setModalValoracion(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Valorar a {nombreOtro}</h3>
            <p className="cr-modal-sub">Calificá la experiencia del trabajo</p>

            <div className="cr-val-group">
              <label>Atención</label>
              <Estrellas valor={valoracion.atencion} onChange={(v) => setValoracion({ ...valoracion, atencion: v })} />
            </div>

            <div className="cr-val-group">
              <label>Trabajo realizado</label>
              <Estrellas valor={valoracion.trabajo} onChange={(v) => setValoracion({ ...valoracion, trabajo: v })} />
            </div>

            <div className="cr-val-group">
              <label>Hospitalidad</label>
              <Estrellas valor={valoracion.hospitalidad} onChange={(v) => setValoracion({ ...valoracion, hospitalidad: v })} />
            </div>

            <div className="cr-val-group">
              <label>Comentario (opcional)</label>
              <textarea
                className="cr-textarea"
                placeholder="Contá tu experiencia..."
                value={valoracion.comentario}
                onChange={(e) => setValoracion({ ...valoracion, comentario: e.target.value })}
                rows={3}
              />
            </div>

            <div className="cr-modal-footer">
              <button className="cr-cancel-btn" onClick={() => setModalValoracion(false)}>Cancelar</button>
              <button className="cr-submit-btn" onClick={enviarValoracion} disabled={enviandoValoracion}>
                {enviandoValoracion ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL RECHAZO */}
      {modalRechazo && (
        <div className="cr-modal-overlay" onClick={() => setModalRechazo(false)}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Por qué no está finalizado?</h3>
            <p className="cr-modal-sub">El trabajador recibirá tu justificación</p>
            <textarea
              className="cr-textarea"
              placeholder="Explicá qué falta completar..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={4}
            />
            <div className="cr-modal-footer">
              <button className="cr-cancel-btn" onClick={() => setModalRechazo(false)}>Cancelar</button>
              <button
                className="cr-submit-btn"
                style={{ background: "#ff5d5d" }}
                onClick={rechazarFinalizacion}
                disabled={enviandoRechazo}
              >
                {enviandoRechazo ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <div className="cr-toast">{toast}</div>}
    </div>
  );
}

export default ChatRoom;

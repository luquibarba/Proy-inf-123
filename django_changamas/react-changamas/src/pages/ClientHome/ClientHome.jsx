import "./ClientHome.css";
import { Home, Search, FileText, MessageSquare, User, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "../../config";

const ESTADO_COLOR = {
  pendiente: "#f0c64f",
  en_proceso: "#5a8cff",
  completada: "#4ecf63",
  cancelada: "#ff5d5d",
};

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
};

function ClientHome() {
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const apellido = localStorage.getItem("apellido") || "";
  const token = localStorage.getItem("access");

  const [workers, setWorkers] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [chats, setChats] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Workers destacados
    fetch(`${API_URL}/api/workers/destacados/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setWorkers(data))
      .catch(() => {});

    // Publicaciones
    fetch(`${API_URL}/api/publicaciones/cliente/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setPublicaciones(data.publicaciones?.slice(0, 2) || []))
      .catch(() => {});

    // Chats
    fetch(`${API_URL}/api/chats/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setChats(data.slice(0, 3));
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  return (
    <div className="worker-page client-page">

      {/* HEADER */}
      <div className="worker-header client-header">
        <div className="worker-logo client-logo">changa+</div>
        <p className="worker-greeting">¡Hola de nuevo,</p>
        <h1>{nombre} {apellido}</h1>
        <div className="search-container">
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Buscar profesionales" />
          </div>
        </div>
      </div>

      {/* PROFESIONALES DESTACADOS */}
      <div className="section">
        <div className="section-header">
          <h3>Profesionales destacados</h3>
          <span>Ver todos</span>
        </div>

        {workers.length === 0 && !cargando && (
          <p style={{ color: "#999", fontSize: 14, padding: "0 4px" }}>
            No hay profesionales disponibles todavía
          </p>
        )}

        <div className="jobs-grid">
          {workers.map(worker => (
            <div
              key={worker.usuario_id}
              className="job-card professional-card"
              onClick={() => navigate(`/perfil/usuario/${worker.usuario_id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="job-content">
                <div className="job-info">
                  <div className="job-title-row">
                    <div className="worker-avatar-small">
                      {worker.foto
                        ? <img src={worker.foto} alt={worker.nombre} />
                        : <span>{worker.nombre?.[0]}</span>
                      }
                    </div>
                    <div className="job-title">{worker.nombre}</div>
                  </div>
                  <div className="job-location">
                    <MapPin size={10} />{worker.zona || "—"}
                  </div>
                  <div className="job-price" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={11} color="#facc15" fill="#facc15" />
                    {parseFloat(worker.calificacion).toFixed(1)}
                    {worker.precio_hora && <span style={{ color: "#999" }}> · ${worker.precio_hora}/h</span>}
                  </div>
                  {worker.categorias?.length > 0 && (
                    <div className="job-presupuestos">
                      {worker.categorias.slice(0, 2).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIS PUBLICACIONES */}
      <div className="section">
        <div className="section-header">
          <h3>Mis publicaciones</h3>
          <span onClick={() => navigate("/client/publicaciones")}>Ver todas</span>
        </div>

        {publicaciones.length === 0 && !cargando && (
          <p style={{ color: "#999", fontSize: 14, padding: "0 4px" }}>
            No tenés publicaciones todavía
          </p>
        )}

        <div className="publications-grid">
          {publicaciones.map(pub => (
            <div
              key={pub.id}
              className="publication-card"
              onClick={() => navigate("/client/publicaciones")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <div className="publication-title-row">
                  <span className="status-dot" style={{ background: ESTADO_COLOR[pub.estado] }}></span>
                  <div className="publication-title">{pub.titulo}</div>
                </div>
                <div className="publication-subtitle">{pub.categoria}</div>
              </div>
              <div style={{ color: ESTADO_COLOR[pub.estado], fontSize: 12, fontWeight: 600 }}>
                {ESTADO_LABEL[pub.estado]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHATS RECIENTES */}
      <div className="section">
        <div className="section-header">
          <h3>Chats recientes</h3>
          <span onClick={() => navigate("/chats", { state: { role: "client" } })}>Ver todos</span>
        </div>

        <div className="chat-box">
          {chats.length === 0 && (
            <div className="chat-footer">No hay mensajes todavía</div>
          )}

          {chats.map(chat => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="chat-avatar">
                {chat.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="chat-content">
                <strong>{chat.name}</strong>
                <p>{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div style={{
                  background: "#8d5cf6", color: "white", borderRadius: "50%",
                  width: 20, height: 20, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700, marginLeft: "auto"
                }}>
                  {chat.unread}
                </div>
              )}
            </div>
          ))}

          {chats.length > 0 && (
            <div className="chat-footer">
              <span
                style={{ cursor: "pointer", color: "#8d5cf6" }}
                onClick={() => navigate("/chats", { state: { role: "client" } })}
              >
                Ver todos los chats
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NAVBAR */}
      <div className="bottom-navbar">
        <div className="nav-item active">
          <Home size={18} /><span>Inicio</span>
        </div>
        <div className="nav-item">
          <Search size={18} /><span>Buscar</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/client/publicaciones")}>
          <FileText size={18} /><span>Solicitudes</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/chats", { state: { role: "client" } })}>
          <MessageSquare size={18} /><span>Chat</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/client/perfil")}>
          <User size={18} /><span>Perfil</span>
        </div>
      </div>

    </div>
  );
}

export default ClientHome;
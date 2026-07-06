import "./WorkerHome.css";
import { Home, Search, FileText, MessageSquare, User, MapPin, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import Navbar from "../../components/Navbar/Navbar";
const LABEL = {
  plomero: "Plomero", electricista: "Electricista", pintor: "Pintor",
  carpintero: "Carpintero", albanil: "Albañil", gasista: "Gasista",
  cerrajero: "Cerrajero", jardinero: "Jardinero", techista: "Techista", otros: "Otros",
};

const ESTADO_COLOR = {
  pendiente: "#f0c64f",
  en_proceso: "#5a8cff",
  completada: "#4ecf63",
  cancelada: "#ff5d5d",
};

function WorkerHome() {
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const apellido = localStorage.getItem("apellido") || "";
  const token = localStorage.getItem("access");

  const [publicaciones, setPublicaciones] = useState([]);
  const [trabajosAceptados, setTrabajosAceptados] = useState([]);
  const [chats, setChats] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/publicaciones/worker/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        console.log("Publicaciones:", data); // ← agregá esto
        setPublicaciones(data.publicaciones?.slice(0, 2) || []);
        setTrabajosAceptados(data.trabajos_aceptados || []);
      })
      .catch((err) => console.error("Error publicaciones:", err));

    fetch(`${API_URL}/api/chats/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        console.log("Chats:", data); // ← y esto
        setChats(data.slice(0, 3));
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error chats:", err);
        setCargando(false);
      });
  }, []);

  return (
    <div className="worker-page">

      {/* HEADER */}
      <div className="worker-header">
        <div className="worker-logo">changa+</div>
        <p className="worker-greeting">¡Hola de nuevo,</p>
        <h1>{nombre} {apellido}</h1>
        <div className="search-container">
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Buscar trabajos disponibles" />
          </div>
        </div>
      </div>

      {/* TRABAJOS DISPONIBLES */}
      <div className="section">
        <div className="section-header">
          <h3>Trabajos disponibles</h3>
          <span onClick={() => navigate("/worker/publicaciones")}>Ver todos</span>
        </div>

        {publicaciones.length === 0 && !cargando && (
          <p style={{ color: "#999", fontSize: 14, padding: "0 4px" }}>
            No hay trabajos disponibles para tus categorías
          </p>
        )}

        <div className="jobs-grid">
          {publicaciones.map(pub => (
            <div
              key={pub.id}
              className="job-card"
              onClick={() => navigate("/worker/publicaciones")}
              style={{ cursor: "pointer" }}
            >
              <div className="job-content">
                <div className="job-info">
                  <div className="job-title-row">
                    <span className="job-dot blue"></span>
                    <div className="job-title">{pub.titulo}</div>
                  </div>
                  <div className="job-location">
                    <MapPin size={10} />{pub.provincia}
                  </div>
                  <div className="job-price">
                    {LABEL[pub.categoria] || pub.categoria}
                  </div>
                  {pub.cant_presupuestos > 0 && (
                    <div className="job-presupuestos">
                      {pub.cant_presupuestos} presupuesto{pub.cant_presupuestos > 1 ? "s" : ""} enviado{pub.cant_presupuestos > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRABAJOS ACEPTADOS */}
      <div className="section">
        <div className="section-header">
          <h3>Trabajos aceptados</h3>
          <span onClick={() => navigate("/chats", { state: { role: "worker" } })}>Ver todos</span>
        </div>

        {trabajosAceptados.length === 0 && !cargando && (
          <p style={{ color: "#999", fontSize: 14, padding: "0 4px" }}>
            Todavía no tenés trabajos aceptados
          </p>
        )}

        <div className="publications-grid">
          {trabajosAceptados.map(trabajo => (
            <div
              key={trabajo.chat_id}
              className="publication-card"
              onClick={() => navigate(`/chat/${trabajo.chat_id}`)}
              style={{ cursor: "pointer" }}
            >
              <div>
                <div className="publication-title-row">
                  <span className="status-dot" style={{ background: ESTADO_COLOR[trabajo.estado] }}></span>
                  <div className="publication-title">{trabajo.titulo}</div>
                </div>
                <div className="publication-subtitle">{trabajo.cliente_nombre}</div>
              </div>
              <div
                className="status"
                style={{ color: ESTADO_COLOR[trabajo.estado], fontSize: 12, fontWeight: 600 }}
              >
                {trabajo.estado}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="section">
        <div className="section-header">
          <h3>Chats recientes</h3>
          <span onClick={() => navigate("/chats", { state: { role: "worker" } })}>Ver todos</span>
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
                onClick={() => navigate("/chats", { state: { role: "worker" } })}
              >
                Ver todos los chats
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NAVBAR */}
      <Navbar rol="worker" activo="Inicio" />

    </div>
  );
}

export default WorkerHome;
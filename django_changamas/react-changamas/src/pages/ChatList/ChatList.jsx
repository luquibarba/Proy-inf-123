import "./ChatList.css";
import { Home, Search, FileText, MessageSquare, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import Navbar from "../../components/Navbar/Navbar";

function ChatList() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("rol") || "worker";

  const [chats, setChats] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/api/chats/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setError("Error al cargar los chats");
          return;
        }

        const data = await res.json();
        setChats(data);
      } catch (err) {
        setError("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="chat-list-page">
      <div className="chat-list-header">
        <div className="chat-logo">changa+</div>
        <h2>Chats</h2>
      </div>

      <div className="chat-search-container">
        <div className="chat-search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar conversación" />
        </div>
      </div>

      <div className="chat-conversations">
        {cargando && <p style={{ textAlign: "center", color: "#999" }}>Cargando chats...</p>}
        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
        {!cargando && chats.length === 0 && (
          <p style={{ textAlign: "center", color: "#999" }}>No tenés chats todavía</p>
        )}

        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            className="chat-card"
            onClick={() => navigate(`/chat/${chat.id}`)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="chat-card-left"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/perfil/usuario/${chat.otro_usuario_id}`);
              }}
            >
              <div className="chat-avatar" style={{ cursor: "pointer" }}>
                {chat.foto
                  ? <img src={chat.foto} alt={chat.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : chat.name.split(" ").map((word) => word[0]).join("").slice(0, 2)
                }
              </div>
            </div>

            <div className="chat-card-center">
              <div className="chat-card-name">{chat.name}</div>
              <div className="chat-card-message">{chat.lastMessage}</div>
            </div>

            <div className="chat-card-right">
              <div className="chat-card-time">{chat.time}</div>
              <div className={chat.online ? "online-dot" : "offline-dot"} />
              {chat.unread > 0 && (
                <div className="unread-badge">{chat.unread}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <Navbar rol={role} activo="Chats" />
    </div>
  );
}

export default ChatList;
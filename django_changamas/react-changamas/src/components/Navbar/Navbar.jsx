import { Home, FileText, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ rol, activo }) {
  const navigate = useNavigate();

  const itemsWorker = [
    { label: "Inicio", icon: <Home size={18} />, ruta: "/worker" },
    { label: "Publicaciones", icon: <FileText size={18} />, ruta: "/worker/publicaciones" },
    { label: "Chats", icon: <MessageSquare size={18} />, ruta: "/chats", state: { role: "worker" } },
    { label: "Mi perfil", icon: <User size={18} />, ruta: "/worker/perfil" },
  ];

  const itemsClient = [
    { label: "Inicio", icon: <Home size={18} />, ruta: "/client" },
    { label: "Solicitudes", icon: <FileText size={18} />, ruta: "/client/publicaciones" },
    { label: "Chat", icon: <MessageSquare size={18} />, ruta: "/chats", state: { role: "client" } },
    { label: "Perfil", icon: <User size={18} />, ruta: "/client/perfil" },
  ];

  const items = rol === "worker" ? itemsWorker : itemsClient;

  return (
    <div className="bottom-navbar">
      {items.map((item) => (
        <div
          key={item.label}
          className={`nav-item ${activo === item.label ? "active" : ""}`}
          onClick={() => item.ruta && navigate(item.ruta, item.state ? { state: item.state } : {})}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default Navbar;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Search, FileText, MessageSquare, User,
  MapPin, Clock, Paperclip, Loader, Send,
} from "lucide-react";
import "./WorkerPublicaciones.css";
import { API_URL } from "../../config";

const LABEL = {
  plomero: "Plomero", electricista: "Electricista", pintor: "Pintor",
  carpintero: "Carpintero", albanil: "Albañil", gasista: "Gasista",
  cerrajero: "Cerrajero", jardinero: "Jardinero", techista: "Techista", otros: "Otros",
};

function WorkerPublicaciones() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [presupuestos, setPresupuestos] = useState({});
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(null);
  const [expandida, setExpandida] = useState(null);
  const [mensajes, setMensajes] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/publicaciones/worker/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPublicaciones(data.publicaciones || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const aceptar = async (pubId) => {
    setEnviando(pubId);
    const p = presupuestos[pubId] || {};

    if (!p.precio || !p.tiempo || !p.detalle) {
      mostrarToast("Completá precio, tiempo y detalle");
      setEnviando(null);
      return;
    }

    const res = await fetch(`${API_URL}/api/publicaciones/${pubId}/aceptar/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        precio_presupuesto: p.precio,
        tiempo_estimado: p.tiempo,
        detalle: p.detalle,
        mensaje: p.mensaje || "",
      }),
    });

    if (res.ok) {
      setPublicaciones((prev) =>
        prev.map((pub) => pub.id === pubId ? { ...pub, ya_enviada: true } : pub)
      );
      setExpandida(null);
      mostrarToast("Presupuesto enviado al cliente");
    } else {
      const data = await res.json();
      mostrarToast(data.error || "Error al enviar presupuesto");
    }
    setEnviando(null);
  };

  return (
    <div className="wp-pub-page">

      {/* HEADER */}
      <div className="wp-pub-header">
        <div className="wp-pub-logo">changa+</div>
        <h2>Trabajos disponibles</h2>
        <p className="wp-pub-sub">Filtrados según tu especialidad</p>
      </div>

      {/* LISTA */}
      <div className="wp-pub-list">
        {cargando && (
          <div className="wp-pub-center"><Loader size={24} className="wp-pub-spin" /></div>
        )}

        {!cargando && publicaciones.length === 0 && (
          <div className="wp-pub-empty">
            <FileText size={40} />
            <p>No hay trabajos disponibles para tus categorías</p>
            <span>Podés agregar más especialidades en tu perfil</span>
          </div>
        )}

        {publicaciones.map((pub) => (
          <div key={pub.id} className={`wp-pub-card ${expandida === pub.id ? "wp-pub-card--open" : ""}`}>

            <div className="wp-pub-card-top">
              <span className="wp-pub-cat">{LABEL[pub.categoria] || pub.categoria}</span>
              <span className="wp-pub-fecha"><Clock size={11} />{pub.creada_en}</span>
            </div>

            <h4 className="wp-pub-titulo">{pub.titulo}</h4>

            <div className="wp-pub-location">
              <MapPin size={12} />{pub.provincia}
            </div>

            <p className="wp-pub-desc">{pub.descripcion}</p>

            {pub.archivo && (
              <a href={pub.archivo} target="_blank" rel="noreferrer" className="wp-pub-adjunto">
                <Paperclip size={12} /> Ver adjunto
              </a>
            )}

            <div className="wp-pub-cliente">
              Publicado por{" "}
              <strong
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate(`/perfil/usuario/${pub.cliente_id}`)}
              >
                {pub.cliente_nombre}
              </strong>
            </div>

            {/* ACCIÓN */}
            {pub.ya_enviada ? (
              <div className="wp-pub-enviada">✓ Solicitud enviada</div>
            ) : expandida === pub.id ? (
              <div className="wp-pub-expand">
                <div className="wp-pub-form-group">
                  <label className="wp-pub-label">Precio presupuestado <span className="wp-pub-required">*</span></label>
                  <input
                    className="wp-pub-input"
                    type="number"
                    placeholder="ej: 15000"
                    value={presupuestos[pub.id]?.precio || ""}
                    onChange={(e) => setPresupuestos({ ...presupuestos, [pub.id]: { ...presupuestos[pub.id], precio: e.target.value } })}
                  />
                </div>

                <div className="wp-pub-form-group">
                  <label className="wp-pub-label">Tiempo estimado <span className="wp-pub-required">*</span></label>
                  <input
                    className="wp-pub-input"
                    type="text"
                    placeholder="ej: 2 días, 1 semana"
                    value={presupuestos[pub.id]?.tiempo || ""}
                    onChange={(e) => setPresupuestos({ ...presupuestos, [pub.id]: { ...presupuestos[pub.id], tiempo: e.target.value } })}
                  />
                </div>

                <div className="wp-pub-form-group">
                  <label className="wp-pub-label">Detalle del trabajo <span className="wp-pub-required">*</span></label>
                  <textarea
                    className="wp-pub-textarea"
                    placeholder="Describí cómo vas a encarar el trabajo..."
                    value={presupuestos[pub.id]?.detalle || ""}
                    onChange={(e) => setPresupuestos({ ...presupuestos, [pub.id]: { ...presupuestos[pub.id], detalle: e.target.value } })}
                    rows={3}
                  />
                </div>

                <div className="wp-pub-form-group">
                  <label className="wp-pub-label">Mensaje adicional <span className="wp-pub-optional">(opcional)</span></label>
                  <textarea
                    className="wp-pub-textarea"
                    placeholder="Algún comentario extra para el cliente..."
                    value={presupuestos[pub.id]?.mensaje || ""}
                    onChange={(e) => setPresupuestos({ ...presupuestos, [pub.id]: { ...presupuestos[pub.id], mensaje: e.target.value } })}
                    rows={2}
                  />
                </div>

                <div className="wp-pub-expand-btns">
                  <button className="wp-pub-cancel" onClick={() => setExpandida(null)}>
                    Cancelar
                  </button>
                  <button
                    className="wp-pub-send"
                    onClick={() => aceptar(pub.id)}
                    disabled={enviando === pub.id}
                  >
                    {enviando === pub.id
                      ? <Loader size={14} className="wp-pub-spin" />
                      : <><Send size={14} /> Enviar presupuesto</>
                    }
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="wp-pub-aceptar"
                onClick={() => setExpandida(pub.id)}
              >
                Enviar presupuesto
              </button>
            )}

          </div>
        ))}
      </div>

      {toast && <div className="wp-pub-toast">{toast}</div>}

      {/* NAVBAR */}
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => navigate("/worker")}>
          <Home size={18} /><span>Inicio</span>
        </div>
        <div className="nav-item">
          <Search size={18} /><span>Explorar</span>
        </div>
        <div className="nav-item active">
          <FileText size={18} /><span>Publicaciones</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/chats", { state: { role: "worker" } })}>
          <MessageSquare size={18} /><span>Chats</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/worker/perfil")}>
          <User size={18} /><span>Mi perfil</span>
        </div>
      </div>
    </div>
  );
}

export default WorkerPublicaciones;
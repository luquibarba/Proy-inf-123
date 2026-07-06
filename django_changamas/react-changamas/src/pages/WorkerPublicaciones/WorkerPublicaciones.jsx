import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Search, FileText, MessageSquare, User,
  MapPin, Clock, Paperclip, Loader, Send, X,
  Calendar, DollarSign, User as UserIcon,
} from "lucide-react";
import "./WorkerPublicaciones.css";
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

function WorkerPublicaciones() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [presupuestos, setPresupuestos] = useState({});
  const [publicaciones, setPublicaciones] = useState([]);
  const [trabajosAceptados, setTrabajosAceptados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(null);
  const [expandida, setExpandida] = useState(null);
  const [toast, setToast] = useState("");
  const [modalResumen, setModalResumen] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [fechaHora, setFechaHora] = useState("");
  const [guardandoFecha, setGuardandoFecha] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/publicaciones/worker/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPublicaciones(data.publicaciones || []);
        setTrabajosAceptados(data.trabajos_aceptados || []);
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

  const abrirResumen = async (chatId) => {
    setModalResumen(chatId);
    setCargandoResumen(true);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/resumen/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResumen(data);
      setFechaHora(data.fecha_hora_encuentro || "");
    } catch (err) {
      mostrarToast("Error al cargar el resumen");
    }
    setCargandoResumen(false);
  };

  const guardarFecha = async () => {
    if (!fechaHora) {
      mostrarToast("Seleccioná una fecha y hora");
      return;
    }
    setGuardandoFecha(true);
    const res = await fetch(`${API_URL}/api/chats/${modalResumen}/resumen/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fecha_hora_encuentro: fechaHora }),
    });

    if (res.ok) {
      mostrarToast("Fecha guardada correctamente");
      setResumen(prev => ({ ...prev, fecha_hora_encuentro: new Date(fechaHora).toLocaleString('es-AR') }));
    } else {
      mostrarToast("Error al guardar la fecha");
    }
    setGuardandoFecha(false);
  };

  return (
    <div className="wp-pub-page">

      {/* HEADER */}
      <div className="wp-pub-header">
        <div className="wp-pub-logo">changa+</div>
        <h2>Publicaciones</h2>
        <p className="wp-pub-sub">Trabajos disponibles y en proceso</p>
      </div>

      {/* TRABAJOS EN PROCESO */}
      {trabajosAceptados.length > 0 && (
        <div className="wp-pub-section">
          <h3 className="wp-pub-section-title">Trabajos en proceso</h3>
          {trabajosAceptados.map(trabajo => (
            <div key={trabajo.chat_id} className="wp-pub-card wp-pub-card--proceso">
              <div className="wp-pub-card-top">
                <span className="wp-pub-cat" style={{ color: ESTADO_COLOR[trabajo.estado] }}>
                  {trabajo.estado === 'en_proceso' ? 'En proceso' : trabajo.estado}
                </span>
              </div>
              <h4 className="wp-pub-titulo">{trabajo.titulo}</h4>
              <div className="wp-pub-cliente">
                Cliente: <strong
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate(`/perfil/usuario/${trabajo.cliente_id}`)}
                >
                  {trabajo.cliente_nombre}
                </strong>
              </div>
              <div className="wp-pub-btns-row">
                <button
                  className="wp-pub-resumen-btn"
                  onClick={() => abrirResumen(trabajo.chat_id)}
                >
                  Resumen del trabajo
                </button>
                <button
                  className="wp-pub-chat-btn"
                  onClick={() => navigate(`/chat/${trabajo.chat_id}`)}
                >
                  Ir al chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRABAJOS DISPONIBLES */}
      <div className="wp-pub-section">
        <h3 className="wp-pub-section-title">Trabajos disponibles</h3>
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
              <div className="wp-pub-location"><MapPin size={12} />{pub.provincia}</div>
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

              {pub.cant_presupuestos > 0 && (
                <div className="wp-pub-counter">
                  {pub.cant_presupuestos} presupuesto{pub.cant_presupuestos > 1 ? "s" : ""} enviado{pub.cant_presupuestos > 1 ? "s" : ""}
                </div>
              )}

              {pub.ya_enviada ? (
                <div className="wp-pub-enviada">✓ Presupuesto enviado</div>
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
                    <button className="wp-pub-cancel" onClick={() => setExpandida(null)}>Cancelar</button>
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
                <button className="wp-pub-aceptar" onClick={() => setExpandida(pub.id)}>
                  Enviar presupuesto
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RESUMEN */}
      {modalResumen && (
        <div className="wp-modal-overlay" onClick={() => setModalResumen(null)}>
          <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wp-modal-header">
              <h3>Resumen del trabajo</h3>
              <button onClick={() => setModalResumen(null)}><X size={20} /></button>
            </div>

            {cargandoResumen ? (
              <div className="wp-pub-center"><Loader size={24} className="wp-pub-spin" /></div>
            ) : resumen && (
              <div className="wp-modal-body">
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Trabajo</span>
                  <span className="wp-resumen-valor">{resumen.titulo}</span>
                </div>
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Cliente</span>
                  <span className="wp-resumen-valor">{resumen.cliente_nombre}</span>
                </div>
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Dirección</span>
                  <span className="wp-resumen-valor">{resumen.cliente_calle} {resumen.cliente_numero}, {resumen.cliente_provincia}</span>
                </div>
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Presupuesto acordado</span>
                  <span className="wp-resumen-valor">${resumen.presupuesto}</span>
                </div>
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Fecha de concordancia</span>
                  <span className="wp-resumen-valor">{resumen.fecha_concordancia}</span>
                </div>
                <div className="wp-resumen-row">
                  <span className="wp-resumen-label">Descripción</span>
                  <span className="wp-resumen-valor">{resumen.descripcion}</span>
                </div>

                <div className="wp-resumen-fecha">
                  <span className="wp-resumen-label">Fecha y hora de encuentro</span>
                  {resumen.fecha_hora_encuentro ? (
                    <span className="wp-resumen-valor">{resumen.fecha_hora_encuentro}</span>
                  ) : (
                    <span className="wp-resumen-vacio">Sin definir</span>
                  )}
                  <input
                    type="datetime-local"
                    className="wp-pub-input"
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                  <button
                    className="wp-pub-send"
                    onClick={guardarFecha}
                    disabled={guardandoFecha}
                    style={{ marginTop: 8, width: "100%" }}
                  >
                    {guardandoFecha ? "Guardando..." : "Guardar fecha"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="wp-pub-toast">{toast}</div>}

      {/* NAVBAR */}
      <Navbar rol="worker" activo="Publicaciones" />
    </div>
  );
}

export default WorkerPublicaciones;
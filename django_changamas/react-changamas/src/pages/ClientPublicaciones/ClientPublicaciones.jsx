import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Search, FileText, MessageSquare, User,
  Plus, X, Paperclip, ChevronDown, Star, MapPin,
  Clock, CheckCircle, XCircle, Loader,
} from "lucide-react";
import "./ClientPublicaciones.css";
import { API_URL } from "../../config";

const CATEGORIAS = [
  "plomero", "electricista", "pintor", "carpintero",
  "albanil", "gasista", "cerrajero", "jardinero", "techista", "otros",
];

const LABEL = {
  plomero: "Plomero", electricista: "Electricista", pintor: "Pintor",
  carpintero: "Carpintero", albanil: "Albañil", gasista: "Gasista",
  cerrajero: "Cerrajero", jardinero: "Jardinero", techista: "Techista", otros: "Otros",
};

const ESTADO_COLOR = {
  pendiente: "estado-pendiente",
  en_proceso: "estado-proceso",
  completada: "estado-completada",
  cancelada: "estado-cancelada",
};

const ESTADO_LABEL = {
  pendiente: "Pendiente", en_proceso: "En proceso",
  completada: "Completada", cancelada: "Cancelada",
};

function ClientPublicaciones() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [menuAbierto, setMenuAbierto] = useState(null); 
  const [modalEditar, setModalEditar] = useState(null); 
  const [formEditar, setFormEditar] = useState({ titulo: "", descripcion: "", categoria: "" });
  const [modalPresupuesto, setModalPresupuesto] = useState(null); 
  const [publicaciones, setPublicaciones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [eligiendo, setEligiendo] = useState(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    titulo: "", descripcion: "", categoria: "", archivo: null,
  });
  const [archivoNombre, setArchivoNombre] = useState("");

  const cargar = () => {
    fetch(`${API_URL}/api/publicaciones/cliente/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPublicaciones(data.publicaciones || []);
        setSolicitudes(data.solicitudes_recibidas || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, archivo: file });
    setArchivoNombre(file.name);
  };
  const crearPublicacion = async () => {
    if (!form.titulo || !form.descripcion || !form.categoria) {
      mostrarToast("Completá todos los campos obligatorios");
      return;
    }
    setEnviando(true);

    const fd = new FormData();
    fd.append("titulo", form.titulo);
    fd.append("descripcion", form.descripcion);
    fd.append("categoria", form.categoria);
    if (form.archivo) fd.append("archivo", form.archivo);

    const res = await fetch(`${API_URL}/api/publicaciones/cliente/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) {
      const nueva = await res.json();
      setPublicaciones((prev) => [nueva, ...prev]);
      setMostrarModal(false);
      setForm({ titulo: "", descripcion: "", categoria: "", archivo: null });
      setArchivoNombre("");
      mostrarToast("Publicación creada");
    } else {
      mostrarToast("Error al crear la publicación");
    }
    setEnviando(false);
  };

    const elegirWorker = async (solicitudId, accion) => {
    setEligiendo(solicitudId);
    const res = await fetch(`${API_URL}/api/solicitudes/${solicitudId}/elegir/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accion }),
    });

    if (res.ok) {
      const data = await res.json();
      if (accion === 'aceptar') {
        navigate(`/chat/${data.chat_id}`);
      } else {
        mostrarToast("Solicitud rechazada");
        cargar();
      }
    } else {
      mostrarToast("Error al contactar al trabajador");
    }
    setEligiendo(null);
  };

  const eliminarPublicacion = async (pubId) => {
  if (!window.confirm("¿Seguro que querés eliminar esta publicación?")) return;

  const res = await fetch(`${API_URL}/api/publicaciones/${pubId}/gestionar/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    setPublicaciones(prev => prev.filter(p => p.id !== pubId));
    mostrarToast("Publicación eliminada");
  } else {
    mostrarToast("Error al eliminar");
  }
  };

  const editarPublicacion = async () => {
      const res = await fetch(`${API_URL}/api/publicaciones/${modalEditar.id}/gestionar/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formEditar),
      });

      if (res.ok) {
        const data = await res.json();
        setPublicaciones(prev => prev.map(p => p.id === modalEditar.id ? { ...p, ...data } : p));
        setModalEditar(null);
        mostrarToast("Publicación actualizada");
      } else {
        mostrarToast("Error al editar");
      }
    };
  return (
    <div className="cp-page">

      {/* HEADER */}
      <div className="cp-header">
        <div className="cp-logo">changa+</div>
        <div className="cp-header-row">
          <h2>Mis publicaciones</h2>
          <button className="cp-new-btn" onClick={() => setMostrarModal(true)}>
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {/* PUBLICACIONES */}
      <div className="cp-section">
        {cargando && (
          <div className="cp-center"><Loader size={24} className="cp-spin" /></div>
        )}

        {!cargando && publicaciones.length === 0 && (
          <div className="cp-empty">
            <FileText size={40} />
            <p>Todavía no publicaste ningún trabajo</p>
            <button onClick={() => setMostrarModal(true)}>Crear primera publicación</button>
          </div>
        )}

        {publicaciones.map((pub) => (
          <div key={pub.id} className="cp-card">
            <div className="cp-card-top">
              <span className="cp-categoria">{LABEL[pub.categoria] || pub.categoria}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`cp-estado ${ESTADO_COLOR[pub.estado]}`}>
                  {ESTADO_LABEL[pub.estado]}
                </span>
                <div className="cp-menu-wrap">
                  <button
                    className="cp-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAbierto(menuAbierto === pub.id ? null : pub.id);
                    }}
                  >
                    ⋮
                  </button>
                  {menuAbierto === pub.id && (
                    <div className="cp-menu-dropdown">
                      {pub.estado === 'pendiente' && (
                        <button onClick={() => {
                          setFormEditar({ titulo: pub.titulo, descripcion: pub.descripcion, categoria: pub.categoria });
                          setModalEditar(pub);
                          setMenuAbierto(null);
                        }}>
                          ✏️ Editar
                        </button>
                      )}
                      <button className="cp-menu-delete" onClick={() => eliminarPublicacion(pub.id)}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <h4 className="cp-card-titulo">{pub.titulo}</h4>
            <p className="cp-card-desc">{pub.descripcion}</p>
            <div className="cp-card-footer">
              <Clock size={12} />{pub.creada_en}
              {pub.archivo && (
                <a href={pub.archivo} target="_blank" rel="noreferrer" className="cp-adjunto">
                  <Paperclip size={12} /> Ver adjunto
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SOLICITUDES RECIBIDAS */}
      {solicitudes.length > 0 && (
        <div className="cp-section">
          <div className="cp-section-title">
            Propuestas recibidas <span className="cp-badge">{solicitudes.length}</span>
          </div>

          {/* Agrupar por publicación */}
          {Object.entries(
            solicitudes.reduce((grupos, sol) => {
              const key = sol.publicacion_id;
              if (!grupos[key]) grupos[key] = { titulo: sol.publicacion_titulo, solicitudes: [] };
              grupos[key].solicitudes.push(sol);
              return grupos;
            }, {})
          ).map(([pubId, grupo]) => (
            <div key={pubId} className="cp-grupo-pub">
              <p className="cp-section-sub">
                Para: <strong>{grupo.titulo}</strong>
              </p>

              {grupo.solicitudes.map((sol) => (
                <div key={sol.id} className="cp-worker-card">
                  <div
                    className="cp-worker-avatar"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/perfil/usuario/${sol.worker_id}`)}
                  >
                    {sol.worker_foto
                      ? <img src={sol.worker_foto} alt="" />
                      : <span>{sol.worker_nombre.split(" ").map(w => w[0]).join("").slice(0,2)}</span>
                    }
                  </div>
                  <div className="cp-worker-info">
                    <strong
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/perfil/usuario/${sol.worker_id}`)}
                    >
                      {sol.worker_nombre}
                    </strong>
                    <div className="cp-worker-meta">
                      {sol.worker_zona && <span><MapPin size={11} />{sol.worker_zona}</span>}
                      <span><Star size={11} />{parseFloat(sol.worker_calificacion).toFixed(1)}</span>
                      {sol.worker_precio && <span>${sol.worker_precio}/h</span>}
                    </div>
                    {sol.mensaje && <p className="cp-worker-msg">"{sol.mensaje}"</p>}
                  </div>
                  <button
                    className="cp-elegir-btn"
                    onClick={() => setModalPresupuesto(sol)}
                  >
                    Ver presupuesto
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA PUBLICACIÓN */}
      {mostrarModal && (
        <div className="cp-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>Nueva publicación</h3>
              <button onClick={() => setMostrarModal(false)}><X size={20} /></button>
            </div>

            <div className="cp-modal-body">
              <label>Título <span>*</span></label>
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej: Instalación eléctrica cocina"
              />

              <label>Categoría <span>*</span></label>
              <div className="cp-select-wrap">
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  <option value="">Seleccioná una categoría</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{LABEL[c]}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>

              <label>Descripción <span>*</span></label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Describí el trabajo que necesitás..."
                rows={4}
              />

              <label>Adjunto <span className="cp-optional">(opcional)</span></label>
              <label className="cp-file-btn">
                <Paperclip size={15} />
                {archivoNombre || "Seleccionar foto o video"}
                <input type="file" accept="image/*,video/*" hidden onChange={handleArchivo} />
              </label>
            </div>

            <div className="cp-modal-footer">
              <button className="cp-cancel-btn" onClick={() => setMostrarModal(false)}>
                Cancelar
              </button>
              <button className="cp-submit-btn" onClick={crearPublicacion} disabled={enviando}>
                {enviando ? <Loader size={15} className="cp-spin" /> : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRESUPUESTO */}
      {modalPresupuesto && (
        <div className="cp-modal-overlay" onClick={() => setModalPresupuesto(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <div>
                <h3>Presupuesto de {modalPresupuesto.worker_nombre}</h3>
                <button
                  className="cp-ver-perfil-btn"
                  onClick={() => navigate(`/perfil/usuario/${modalPresupuesto.worker_id}`)}
                >
                  Ver perfil completo
                </button>
              </div>
              <button onClick={() => setModalPresupuesto(null)}><X size={20} /></button>
            </div>

            <div className="cp-modal-body">
              <div className="cp-presupuesto-row">
                <span className="cp-presupuesto-label">Precio</span>
                <span className="cp-presupuesto-valor">${modalPresupuesto.precio_presupuesto}</span>
              </div>
              <div className="cp-presupuesto-row">
                <span className="cp-presupuesto-label">Tiempo estimado</span>
                <span className="cp-presupuesto-valor">{modalPresupuesto.tiempo_estimado}</span>
              </div>
              <div className="cp-presupuesto-row">
                <span className="cp-presupuesto-label">Detalle</span>
                <span className="cp-presupuesto-valor">{modalPresupuesto.detalle}</span>
              </div>
              {modalPresupuesto.mensaje && (
                <div className="cp-presupuesto-row">
                  <span className="cp-presupuesto-label">Mensaje</span>
                  <span className="cp-presupuesto-valor">"{modalPresupuesto.mensaje}"</span>
                </div>
              )}
              <div className="cp-worker-meta" style={{ marginTop: 12 }}>
                {modalPresupuesto.worker_zona && <span><MapPin size={11} />{modalPresupuesto.worker_zona}</span>}
                <span><Star size={11} />{parseFloat(modalPresupuesto.worker_calificacion).toFixed(1)}</span>
                {modalPresupuesto.worker_precio && <span>${modalPresupuesto.worker_precio}/h (tarifa habitual)</span>}
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                className="cp-cancel-btn"
                onClick={() => {
                  elegirWorker(modalPresupuesto.id, 'rechazar');
                  setModalPresupuesto(null);
                }}
              >
                Rechazar
              </button>
              <button
                className="cp-submit-btn"
                onClick={() => {
                  elegirWorker(modalPresupuesto.id, 'aceptar');
                  setModalPresupuesto(null);
                }}
                disabled={eligiendo === modalPresupuesto.id}
              >
                {eligiendo === modalPresupuesto.id ? <Loader size={15} className="cp-spin" /> : "Aceptar y chatear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PUBLICACIÓN */}
      {modalEditar && (
        <div className="cp-modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>Editar publicación</h3>
              <button onClick={() => setModalEditar(null)}><X size={20} /></button>
            </div>
            <div className="cp-modal-body">
              <label>Título</label>
              <input
                value={formEditar.titulo}
                onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
              />
              <label>Categoría</label>
              <div className="cp-select-wrap">
                <select
                  value={formEditar.categoria}
                  onChange={(e) => setFormEditar({ ...formEditar, categoria: e.target.value })}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{LABEL[c]}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
              <label>Descripción</label>
              <textarea
                value={formEditar.descripcion}
                onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
                rows={4}
              />
            </div>
            <div className="cp-modal-footer">
              <button className="cp-cancel-btn" onClick={() => setModalEditar(null)}>Cancelar</button>
              <button className="cp-submit-btn" onClick={editarPublicacion}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <div className="cp-toast">{toast}</div>}

      {/* NAVBAR */}
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => navigate("/client")}>
          <Home size={18} /><span>Inicio</span>
        </div>
        <div className="nav-item">
          <Search size={18} /><span>Buscar</span>
        </div>
        <div className="nav-item active">
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
export default ClientPublicaciones;
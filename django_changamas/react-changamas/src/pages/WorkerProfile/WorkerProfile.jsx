import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Search, FileText, MessageSquare, User, Camera,
  Plus, Trash2, CheckCircle, Star, MapPin, DollarSign,
  Edit3, Save, X, Clock, Navigation,
} from "lucide-react";
import "./WorkerProfile.css";
import { API_URL } from "../../config";
import Navbar from "../../components/Navbar/Navbar";

const CATEGORIAS_DISPONIBLES = [
  "Plomero", "Electricista", "Pintor", "Carpintero",
  "Albañil", "Gasista", "Cerrajero", "Jardinero", "Techista", "Otros",
];

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIAS_LABEL = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };

const DISPONIBILIDAD_DEFAULT = {
  lunes:     { activo: false, desde: "08:00", hasta: "18:00" },
  martes:    { activo: false, desde: "08:00", hasta: "18:00" },
  miercoles: { activo: false, desde: "08:00", hasta: "18:00" },
  jueves:    { activo: false, desde: "08:00", hasta: "18:00" },
  viernes:   { activo: false, desde: "08:00", hasta: "18:00" },
  sabado:    { activo: false, desde: "08:00", hasta: "18:00" },
  domingo:   { activo: false, desde: "08:00", hasta: "18:00" },
};

function Estrellas({ valor }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => {
        const llena = i <= Math.floor(valor);
        const media = !llena && i === Math.ceil(valor) && valor % 1 >= 0.5;
        return (
          <div key={i} style={{ position: "relative", width: 14, height: 14 }}>
            <Star size={14} fill="none" color="#aaa" />
            {(llena || media) && (
              <div style={{
                position: "absolute", top: 0, left: 0,
                width: llena ? "100%" : "50%",
                overflow: "hidden"
              }}>
                <Star size={14} fill="#facc15" color="#facc15" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WorkerProfile() {
  const navigate = useNavigate();
  const fotoRef = useRef();
  const proyectoRef = useRef();

  const [perfil, setPerfil] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    descripcion: "",
    categorias: [],
    precio_hora: "",
    zona: "",
    radio_km: "",
    disponibilidad: DISPONIBILIDAD_DEFAULT,
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetch(`${API_URL}/api/perfil/worker/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPerfil(data);
        setForm({
          descripcion: data.descripcion || "",
          categorias: data.categorias || [],
          precio_hora: data.precio_hora || "",
          zona: data.zona || "",
          radio_km: data.radio_km || "",
          disponibilidad: Object.keys(data.disponibilidad || {}).length > 0
            ? data.disponibilidad
            : DISPONIBILIDAD_DEFAULT,
        });

        // Cargar reseñas
        fetch(`${API_URL}/api/perfil/worker/${data.usuario_id}/resenas/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(setResenas)
          .catch(() => {});

        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const toggleCategoria = (cat) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat],
    }));
  };

  const toggleDia = (dia) => {
    setForm(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: { ...prev.disponibilidad[dia], activo: !prev.disponibilidad[dia].activo }
      }
    }));
  };

  const setHorario = (dia, campo, valor) => {
    setForm(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: { ...prev.disponibilidad[dia], [campo]: valor }
      }
    }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    const fd = new FormData();
    fd.append("descripcion", form.descripcion);
    fd.append("categorias", JSON.stringify(form.categorias));
    fd.append("precio_hora", form.precio_hora);
    fd.append("zona", form.zona);
    fd.append("radio_km", form.radio_km);
    fd.append("disponibilidad", JSON.stringify(form.disponibilidad));
    if (fotoFile) fd.append("foto", fotoFile);

    const res = await fetch(`${API_URL}/api/perfil/worker/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) {
      setMensaje("Perfil guardado");
      setEditando(false);
      setPerfil(prev => ({ ...prev, ...form, foto: fotoPreview || prev.foto }));
    } else {
      setMensaje("Error al guardar");
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const subirProyecto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("archivo", file);
    fd.append("descripcion", "");
    const res = await fetch(`${API_URL}/api/perfil/worker/proyectos/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      const nuevo = await res.json();
      setPerfil(prev => ({ ...prev, proyectos: [...(prev.proyectos || []), nuevo] }));
    }
  };

  const eliminarProyecto = async (id) => {
    const res = await fetch(`${API_URL}/api/perfil/worker/proyectos/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPerfil(prev => ({ ...prev, proyectos: prev.proyectos.filter(p => p.id !== id) }));
    }
  };

  const fotoMostrada = fotoPreview || perfil?.foto;

  if (cargando) return <div className="wp-loading"><div className="wp-spinner" /></div>;

  return (
    <div className="wp-page">

      {/* HEADER */}
      <div className="wp-header">
        <div className="wp-logo">changa+</div>
        <div className="wp-avatar-wrap">
          <div className="wp-avatar" onClick={() => editando && fotoRef.current.click()} style={{ cursor: editando ? "pointer" : "default" }}>
            {fotoMostrada
              ? <img src={fotoMostrada} alt="foto" className="wp-avatar-img" />
              : <span className="wp-avatar-initials">{perfil?.nombre?.[0]}{perfil?.apellido?.[0]}</span>
            }
            {editando && <div className="wp-avatar-overlay"><Camera size={20} /></div>}
          </div>
          <input ref={fotoRef} type="file" accept="image/*" hidden onChange={handleFoto} />
          {perfil?.verificado && <div className="wp-verified"><CheckCircle size={16} />Verificado</div>}
        </div>
        <h1 className="wp-name">{perfil?.nombre} {perfil?.apellido}</h1>
        <div className="wp-meta">
          <span><MapPin size={13} />{perfil?.provincia || "Sin zona"}</span>
          <span><Star size={13} />{perfil?.calificacion || "0.00"}</span>
        </div>
        <button
          className={`wp-edit-btn ${editando ? "wp-edit-btn--cancel" : ""}`}
          onClick={() => { setEditando(!editando); setFotoPreview(null); setFotoFile(null); }}
        >
          {editando ? <><X size={14} /> Cancelar</> : <><Edit3 size={14} /> Editar perfil</>}
        </button>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="wp-section">
        <h3 className="wp-section-title">Sobre mí</h3>
        {editando
          ? <textarea className="wp-textarea" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Contá un poco sobre tu experiencia..." rows={4} />
          : <p className="wp-desc-text">{perfil?.descripcion || <span className="wp-empty">Sin descripción aún</span>}</p>
        }
      </div>

      {/* CATEGORÍAS */}
      <div className="wp-section">
        <h3 className="wp-section-title">Especialidades</h3>
        <div className="wp-tags">
          {editando
            ? CATEGORIAS_DISPONIBLES.map(cat => (
                <button key={cat} className={`wp-tag ${form.categorias.includes(cat) ? "wp-tag--active" : ""}`} onClick={() => toggleCategoria(cat)}>{cat}</button>
              ))
            : perfil?.categorias?.length > 0
              ? perfil.categorias.map(cat => <span key={cat} className="wp-tag wp-tag--active">{cat}</span>)
              : <span className="wp-empty">Sin categorías</span>
          }
        </div>
      </div>

      {/* PRECIO, ZONA Y RADIO */}
      <div className="wp-section wp-row">
        <div className="wp-half">
          <h3 className="wp-section-title"><DollarSign size={14} /> Precio / hora</h3>
          {editando
            ? <input className="wp-input" type="number" value={form.precio_hora} onChange={e => setForm({ ...form, precio_hora: e.target.value })} placeholder="ej: 5000" />
            : <p className="wp-value">{perfil?.precio_hora ? `$${perfil.precio_hora}` : <span className="wp-empty">—</span>}</p>
          }
        </div>
        <div className="wp-half">
          <h3 className="wp-section-title"><MapPin size={14} /> Zona de trabajo</h3>
          {editando
            ? <input className="wp-input" value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} placeholder="ej: Quilmes, CABA" />
            : <p className="wp-value">{perfil?.zona || <span className="wp-empty">—</span>}</p>
          }
        </div>
      </div>

      <div className="wp-section">
        <h3 className="wp-section-title"><Navigation size={14} /> Radio de trabajo</h3>
        {editando
          ? <input className="wp-input" type="number" value={form.radio_km} onChange={e => setForm({ ...form, radio_km: e.target.value })} placeholder="ej: 20 km" />
          : <p className="wp-value">{perfil?.radio_km ? `${perfil.radio_km} km` : <span className="wp-empty">—</span>}</p>
        }
      </div>

      {/* DISPONIBILIDAD */}
      <div className="wp-section">
        <h3 className="wp-section-title"><Clock size={14} /> Disponibilidad</h3>
        <div className="wp-disponibilidad">
          {DIAS.map(dia => {
            const d = editando ? form.disponibilidad[dia] : perfil?.disponibilidad?.[dia];
            if (!d) return null;
            return (
              <div key={dia} className={`wp-dia-row ${d.activo ? "wp-dia-row--active" : ""}`}>
                <div className="wp-dia-label">
                  {editando && (
                    <input type="checkbox" checked={d.activo} onChange={() => toggleDia(dia)} />
                  )}
                  <span>{DIAS_LABEL[dia]}</span>
                </div>
                {d.activo
                  ? editando
                    ? (
                      <div className="wp-dia-horario">
                        <input type="time" className="wp-input wp-time-input" value={d.desde} onChange={e => setHorario(dia, "desde", e.target.value)} />
                        <span>a</span>
                        <input type="time" className="wp-input wp-time-input" value={d.hasta} onChange={e => setHorario(dia, "hasta", e.target.value)} />
                      </div>
                    )
                    : <span className="wp-dia-horario-text">{d.desde} — {d.hasta}</span>
                  : <span className="wp-empty">No disponible</span>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* PROYECTOS */}
      <div className="wp-section">
        <div className="wp-section-header">
          <h3 className="wp-section-title">Proyectos</h3>
          {editando && (
            <>
              <button className="wp-add-btn" onClick={() => proyectoRef.current.click()}>
                <Plus size={14} /> Agregar
              </button>
              <input ref={proyectoRef} type="file" accept="image/*,video/*" hidden onChange={subirProyecto} />
            </>
          )}
        </div>
          {perfil?.proyectos?.length > 0
            ? (
              <div className="wp-projects-grid">
                {perfil.proyectos.map(p => (
                  <div key={p.id} className="wp-project-card">
                    {p.archivo.match(/\.(mp4|webm|mov)$/i)
                      ? <video src={p.archivo} className="wp-project-media" controls />
                      : <img src={p.archivo} alt={p.descripcion} className="wp-project-media" />
                    }
                    {editando && (
                      <button className="wp-project-delete" onClick={() => eliminarProyecto(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
            : <p className="wp-empty">Todavía no subiste proyectos</p>
          }
      </div>

      {/* RESEÑAS */}
      <div className="wp-section">
        <h3 className="wp-section-title"><Star size={14} /> Reseñas ({resenas.length})</h3>
        {resenas.length > 0
          ? resenas.map(r => (
            <div key={r.id} className="wp-resena">
              <div className="wp-resena-header">
                <div className="wp-resena-avatar">
                  {r.cliente_foto
                    ? <img src={r.cliente_foto} alt={r.cliente_nombre} className="wp-resena-foto" />
                    : <span>{r.cliente_nombre?.[0]}</span>
                  }
                </div>
                <div className="wp-resena-info">
                  <strong>{r.cliente_nombre}</strong>
                  <Estrellas valor={r.calificacion} />
                </div>
                <span className="wp-resena-fecha">{r.creada_en}</span>
              </div>
              {r.comentario && <p className="wp-resena-comentario">{r.comentario}</p>}
            </div>
          ))
          : <p className="wp-empty">Todavía no hay reseñas</p>
        }
      </div>

      {/* GUARDAR */}
      {editando && (
        <div className="wp-save-bar">
          <button className="wp-save-btn" onClick={guardarPerfil} disabled={guardando}>
            <Save size={16} />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}

      {mensaje && <div className="wp-toast">{mensaje}</div>}

      {/* NAVBAR */}
      <Navbar rol="worker" activo="Mi perfil" />
    </div>
  );
}

export default WorkerProfile;
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Search, FileText, MessageSquare, User,
  Camera, Edit3, Save, X, MapPin, Star, Clock,
} from "lucide-react";
import "./ClientProfile.css";
import { API_URL } from "../../config";
import Navbar from "../../components/Navbar/Navbar";

function Estrellas({ valor }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} fill={i <= valor ? "#facc15" : "none"} color={i <= valor ? "#facc15" : "#555"} />
      ))}
    </div>
  );
}

function ClientProfile() {
  const navigate = useNavigate();
  const fotoRef = useRef();

  const [perfil, setPerfil] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({ zona: "" });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetch(`${API_URL}/api/perfil/client/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setPerfil(data);
        setForm({ zona: data.zona || "" });

        fetch(`${API_URL}/api/perfil/client/${data.usuario_id}/resenas/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(setResenas)
          .catch(() => {});

        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    const fd = new FormData();
    fd.append("zona", form.zona);
    if (fotoFile) fd.append("foto", fotoFile);

    const res = await fetch(`${API_URL}/api/perfil/client/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) {
      setMensaje("Perfil actualizado");
      setEditando(false);
      setPerfil(prev => ({ ...prev, zona: form.zona, foto: fotoPreview || prev.foto }));
    } else {
      setMensaje("Error al guardar");
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const fotoMostrada = fotoPreview || perfil?.foto;

  const ESTADO_COLOR = {
    pendiente: "#f0c64f",
    en_proceso: "#5a8cff",
    completada: "#4ecf63",
    cancelada: "#ff5d5d",
  };

  if (cargando) return <div className="cp-loading"><div className="cp-spinner" /></div>;

  return (
    <div className="cp-page">

      {/* HEADER */}
      <div className="cp-header">
        <div className="cp-logo">changa+</div>

        <div className="cp-avatar-wrap">
          <div
            className="cp-avatar"
            onClick={() => editando && fotoRef.current.click()}
            style={{ cursor: editando ? "pointer" : "default" }}
          >
            {fotoMostrada
              ? <img src={fotoMostrada} alt="foto" className="cp-avatar-img" />
              : <span className="cp-avatar-initials">{perfil?.nombre?.[0]}{perfil?.apellido?.[0]}</span>
            }
            {editando && <div className="cp-avatar-overlay"><Camera size={20} /></div>}
          </div>
          <input ref={fotoRef} type="file" accept="image/*" hidden onChange={handleFoto} />
        </div>

        <h1 className="cp-name">{perfil?.nombre} {perfil?.apellido}</h1>

        <div className="cp-meta">
          <span><MapPin size={13} />{perfil?.provincia || "—"}</span>
          <span><Star size={13} />{perfil?.calificacion || "0.00"}</span>
        </div>

        <button
          className={`cp-edit-btn ${editando ? "cp-edit-btn--cancel" : ""}`}
          onClick={() => { setEditando(!editando); setFotoPreview(null); setFotoFile(null); }}
        >
          {editando ? <><X size={14} /> Cancelar</> : <><Edit3 size={14} /> Editar perfil</>}
        </button>
      </div>

      {/* ZONA */}
      <div className="cp-section">
        <h3 className="cp-section-title"><MapPin size={14} /> Zona de residencia</h3>
        {editando
          ? <input className="cp-input" value={form.zona} onChange={e => setForm({ zona: e.target.value })} placeholder="ej: Quilmes, Buenos Aires" />
          : <p className="cp-value">{perfil?.zona || <span className="cp-empty">—</span>}</p>
        }
      </div>

      {/* GUARDAR */}
      {editando && (
        <div className="cp-save-bar">
          <button className="cp-save-btn" onClick={guardarPerfil} disabled={guardando}>
            <Save size={16} />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}

      {/* HISTORIAL DE PUBLICACIONES */}
      <div className="cp-section">
        <h3 className="cp-section-title"><FileText size={14} /> Mis publicaciones</h3>
        {perfil?.publicaciones?.length > 0
          ? perfil.publicaciones.map(p => (
            <div key={p.id} className="cp-pub-card">
              <div className="cp-pub-info">
                <div className="cp-pub-titulo">{p.titulo}</div>
                <div className="cp-pub-categoria">{p.categoria}</div>
                <div className="cp-pub-fecha"><Clock size={11} /> {p.creada_en}</div>
              </div>
              <div className="cp-pub-estado" style={{ color: ESTADO_COLOR[p.estado] }}>
                {p.estado}
              </div>
            </div>
          ))
          : <p className="cp-empty">No tenés publicaciones todavía</p>
        }
      </div>

      {/* RESEÑAS */}
      <div className="cp-section">
        <h3 className="cp-section-title"><Star size={14} /> Reseñas ({resenas.length})</h3>
        {resenas.length > 0
          ? resenas.map(r => (
            <div key={r.id} className="cp-resena">
              <div className="cp-resena-header">
                <div className="cp-resena-avatar">
                  {r.worker_foto
                    ? <img src={r.worker_foto} alt={r.worker_nombre} className="cp-resena-foto" />
                    : <span>{r.worker_nombre?.[0]}</span>
                  }
                </div>
                <div className="cp-resena-info">
                  <strong>{r.worker_nombre}</strong>
                  <Estrellas valor={r.calificacion} />
                </div>
                <span className="cp-resena-fecha">{r.creada_en}</span>
              </div>
              {r.comentario && <p className="cp-resena-comentario">{r.comentario}</p>}
            </div>
          ))
          : <p className="cp-empty">Todavía no hay reseñas</p>
        }
      </div>

      {mensaje && <div className="cp-toast">{mensaje}</div>}

      {/* NAVBAR */}
      <Navbar rol="client" activo="Perfil" />
    </div>
  );
}

export default ClientProfile;
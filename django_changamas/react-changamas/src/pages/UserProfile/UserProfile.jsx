import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Star, Clock, DollarSign,
  Navigation, CheckCircle, FileText,
} from "lucide-react";
import "./UserProfile.css";
import { API_URL } from "../../config";

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIAS_LABEL = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };

const ESTADO_COLOR = {
  pendiente: "#f0c64f",
  en_proceso: "#5a8cff",
  completada: "#4ecf63",
  cancelada: "#ff5d5d",
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

function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("access");

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/perfil/usuario/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setPerfil(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [id]);

  if (cargando) return <div className="up-loading"><div className="up-spinner" /></div>;
  if (!perfil) return <div className="up-loading"><p>Perfil no encontrado</p></div>;

  return (
    <div className="up-page">

      {/* HEADER */}
      <div className={`up-header ${perfil.rol === 'worker' ? 'up-header--worker' : 'up-header--client'}`}>
        <button className="up-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <div className="up-avatar-wrap">
          <div className="up-avatar">
            {perfil.foto
              ? <img src={perfil.foto} alt="foto" className="up-avatar-img" />
              : <span className="up-avatar-initials">{perfil.nombre?.[0]}{perfil.apellido?.[0]}</span>
            }
          </div>
          {perfil.verificado && (
            <div className="up-verified"><CheckCircle size={14} /> Verificado</div>
          )}
        </div>

        <h1 className="up-name">{perfil.nombre} {perfil.apellido}</h1>

        <div className="up-rol-badge">
          {perfil.rol === 'worker' ? 'Trabajador' : 'Cliente'}
        </div>

        <div className="up-meta">
          <span><MapPin size={13} />{perfil.provincia || "—"}</span>
          <span><Star size={13} />{perfil.calificacion || "0.00"}</span>
          {perfil.rol === 'worker' && (
            <span>{perfil.cantidad_trabajos} trabajos</span>
          )}
        </div>
      </div>

      {/* WORKER: descripción */}
      {perfil.rol === 'worker' && perfil.descripcion && (
        <div className="up-section">
          <h3 className="up-section-title">Sobre mí</h3>
          <p className="up-desc">{perfil.descripcion}</p>
        </div>
      )}

      {/* WORKER: especialidades */}
      {perfil.rol === 'worker' && perfil.categorias?.length > 0 && (
        <div className="up-section">
          <h3 className="up-section-title">Especialidades</h3>
          <div className="up-tags">
            {perfil.categorias.map(cat => (
              <span key={cat} className="up-tag">{cat}</span>
            ))}
          </div>
        </div>
      )}

      {/* WORKER: precio y zona */}
      {perfil.rol === 'worker' && (
        <div className="up-section up-row">
          <div className="up-half">
            <h3 className="up-section-title"><DollarSign size={13} /> Precio / hora</h3>
            <p className="up-value">{perfil.precio_hora ? `$${perfil.precio_hora}` : "—"}</p>
          </div>
          <div className="up-half">
            <h3 className="up-section-title"><MapPin size={13} /> Zona</h3>
            <p className="up-value">{perfil.zona || "—"}</p>
          </div>
        </div>
      )}

      {/* WORKER: radio */}
      {perfil.rol === 'worker' && perfil.radio_km && (
        <div className="up-section">
          <h3 className="up-section-title"><Navigation size={13} /> Radio de trabajo</h3>
          <p className="up-value">{perfil.radio_km} km</p>
        </div>
      )}

      {/* WORKER: disponibilidad */}
      {perfil.rol === 'worker' && perfil.disponibilidad && Object.keys(perfil.disponibilidad).length > 0 && (
        <div className="up-section">
          <h3 className="up-section-title"><Clock size={13} /> Disponibilidad</h3>
          <div className="up-disponibilidad">
            {DIAS.map(dia => {
              const d = perfil.disponibilidad[dia];
              if (!d) return null;
              return (
                <div key={dia} className={`up-dia-row ${d.activo ? "up-dia-row--active" : ""}`}>
                  <span className="up-dia-label">{DIAS_LABEL[dia]}</span>
                  {d.activo
                    ? <span className="up-dia-horario">{d.desde} — {d.hasta}</span>
                    : <span className="up-dia-off">No disponible</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WORKER: proyectos */}
      {perfil.rol === 'worker' && perfil.proyectos?.length > 0 && (
        <div className="up-section">
          <h3 className="up-section-title">Proyectos</h3>
          <div className="up-projects-grid">
            {perfil.proyectos.map(p => (
              <div key={p.id} className="up-project-card">
                {p.archivo.match(/\.(mp4|webm|mov)$/i)
                  ? <video src={p.archivo} className="up-project-media" controls />
                  : <img src={p.archivo} alt={p.descripcion} className="up-project-media" />
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLIENT: zona */}
      {perfil.rol === 'client' && (
        <div className="up-section">
          <h3 className="up-section-title"><MapPin size={13} /> Zona de residencia</h3>
          <p className="up-value">{perfil.zona || "—"}</p>
        </div>
      )}

      {/* CLIENT: publicaciones */}
      {perfil.rol === 'client' && perfil.publicaciones?.length > 0 && (
        <div className="up-section">
          <h3 className="up-section-title"><FileText size={13} /> Publicaciones recientes</h3>
          {perfil.publicaciones.map(p => (
            <div key={p.id} className="up-pub-card">
              <div className="up-pub-info">
                <div className="up-pub-titulo">{p.titulo}</div>
                <div className="up-pub-categoria">{p.categoria}</div>
                <div className="up-pub-fecha"><Clock size={11} /> {p.creada_en}</div>
              </div>
              <div className="up-pub-estado" style={{ color: ESTADO_COLOR[p.estado] }}>
                {p.estado}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESEÑAS */}
      <div className="up-section">
        <h3 className="up-section-title"><Star size={13} /> Reseñas ({perfil.resenas?.length || 0})</h3>
        {perfil.resenas?.length > 0
          ? perfil.resenas.map(r => (
            <div key={r.id} className="up-resena">
              <div className="up-resena-header">
                <div className="up-resena-avatar">
                  {r.cliente_foto
                    ? <img src={r.cliente_foto} alt={r.cliente_nombre} className="up-resena-foto" />
                    : <span>{r.cliente_nombre?.[0]}</span>
                  }
                </div>
                <div className="up-resena-info">
                  <strong>{r.cliente_nombre}</strong>
                  <Estrellas valor={r.calificacion} />
                </div>
                <span className="up-resena-fecha">{r.creada_en}</span>
              </div>
              {r.comentario && <p className="up-resena-comentario">{r.comentario}</p>}
            </div>
          ))
          : <p className="up-empty">Todavía no hay reseñas</p>
        }
      </div>

    </div>
  );
}

export default UserProfile;
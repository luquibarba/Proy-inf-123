import "./Register.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

function Register() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Trabajador");
  const [gender, setGender] = useState("Hombre");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dia: "",
    mes: "",
    anio: "",
    dni: "",
    provincia: "",
    calle: "",
    numero: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setCargando(true);

    const fecha_nac = `${form.anio}-${form.mes.padStart(2, "0")}-${form.dia.padStart(2, "0")}`;

    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          genero: gender === "Hombre" ? "M" : "F",
          fecha_nac,
          dni: form.dni,
          provincia: form.provincia,
          calle: form.calle,
          numero: form.numero,
          email: form.email,
          password: form.password,
          rol: selectedRole === "Trabajador" ? "worker" : "client",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
        return;
      }

      // Guardamos el token
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("rol", data.rol);

      // Redirigimos según el rol
      if (data.rol === "worker") {
        navigate("/worker");
      } else {
        navigate("/client");
      }

    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <motion.div
      className="phone-container"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <div className="register-top-section">
        <div className="logo">changa+</div>
        <div className="welcome-card">
          <h1>Crear<br />cuenta</h1>
          <p>Regístrate para comenzar</p>
          <div className="role-selector">
            <button
              className={`role ${selectedRole === "Trabajador" ? "active-register" : ""}`}
              onClick={() => setSelectedRole("Trabajador")}
            >
              Trabajador
            </button>
            <button
              className={`role ${selectedRole === "Cliente" ? "active-register" : ""}`}
              onClick={() => setSelectedRole("Cliente")}
            >
              Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="register-form">

        <div className="input-group">
          <label>Nombre</label>
          <input type="text" name="nombre" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Apellido</label>
          <input type="text" name="apellido" onChange={handleChange} />
        </div>

        <div className="gender-wrapper">
          <label>Género</label>
          <div className="gender-selector">
            <button
              type="button"
              className={gender === "Hombre" ? "gender-btn active-gender" : "gender-btn"}
              onClick={() => setGender("Hombre")}
            >♂</button>
            <button
              type="button"
              className={gender === "Mujer" ? "gender-btn active-gender" : "gender-btn"}
              onClick={() => setGender("Mujer")}
            >♀</button>
          </div>
        </div>

        <div className="input-group">
          <label>Fecha de nacimiento</label>
          <div className="date-row">
            <input type="text" name="dia" placeholder="dd" onChange={handleChange} />
            <input type="text" name="mes" placeholder="mm" onChange={handleChange} />
            <input type="text" name="anio" placeholder="aaaa" onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <label>DNI / CUIT</label>
          <input type="text" name="dni" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Provincia</label>
          <input type="text" name="provincia" onChange={handleChange} />
        </div>

        <div className="street-row">
          <div className="input-group">
            <label>Calle</label>
            <input type="text" name="calle" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Número</label>
            <input type="text" name="numero" onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <label>Correo Electrónico</label>
          <input type="email" name="email" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input type="password" name="password" onChange={handleChange} />
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <button className="register-btn" onClick={handleSubmit} disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="divider"><span>O</span></div>

        <p className="register-text">
          ¿Ya tienes cuenta?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
            Inicia sesión
          </a>
        </p>

      </div>
    </motion.div>
  );
}

export default Register;
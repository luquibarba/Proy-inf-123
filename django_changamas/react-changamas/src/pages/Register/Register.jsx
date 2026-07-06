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
  const [errores, setErrores] = useState({});
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Al corregir un campo, sacamos su error para que el feedback sea inmediato
    if (errores[name]) {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia[name];
        return copia;
      });
    }
  };

  // ====================
  // VALIDACIÓN DE CAMPOS
  // ====================
  const validarFormulario = () => {
    const nuevosErrores = {};
    const soloLetras = /^[A-Za-zÀ-ÿ\s]{2,40}$/;

    if (!soloLetras.test(form.nombre.trim())) {
      nuevosErrores.nombre = "Ingresá un nombre válido (solo letras).";
    }

    if (!soloLetras.test(form.apellido.trim())) {
      nuevosErrores.apellido = "Ingresá un apellido válido (solo letras).";
    }

    // Fecha de nacimiento
    const dia = parseInt(form.dia, 10);
    const mes = parseInt(form.mes, 10);
    const anio = parseInt(form.anio, 10);
    const anioActual = new Date().getFullYear();

    if (!form.dia.trim() || !form.mes.trim() || !form.anio.trim()) {
      nuevosErrores.fecha = "Completá tu fecha de nacimiento.";
    } else if (
      isNaN(dia) || isNaN(mes) || isNaN(anio) ||
      dia < 1 || dia > 31 ||
      mes < 1 || mes > 12 ||
      anio < 1900 || anio > anioActual
    ) {
      nuevosErrores.fecha = "La fecha ingresada no es válida.";
    } else {
      const fecha = new Date(anio, mes - 1, dia);
      const esFechaReal =
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia;

      if (!esFechaReal) {
        nuevosErrores.fecha = "Esa fecha no existe.";
      } else {
        const hoy = new Date();
        let edad = hoy.getFullYear() - anio;
        const noCumplioAun =
          hoy.getMonth() < mes - 1 ||
          (hoy.getMonth() === mes - 1 && hoy.getDate() < dia);
        if (noCumplioAun) edad--;

        if (edad < 18) {
          nuevosErrores.fecha = "Tenés que ser mayor de 18 años para registrarte.";
        }
      }
    }

    // DNI / CUIT (7-8 dígitos para DNI, 11 para CUIT)
    const soloDigitosDni = form.dni.replace(/\D/g, "");
    if (!soloDigitosDni) {
      nuevosErrores.dni = "Ingresá tu DNI o CUIT.";
    } else if (![7, 8, 11].includes(soloDigitosDni.length)) {
      nuevosErrores.dni = "El DNI debe tener 7-8 dígitos (o el CUIT 11).";
    }

    if (!form.provincia.trim()) {
      nuevosErrores.provincia = "Ingresá tu provincia.";
    }

    if (!form.calle.trim()) {
      nuevosErrores.calle = "Ingresá tu calle.";
    }

    if (!form.numero.trim()) {
      nuevosErrores.numero = "Ingresá el número.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      nuevosErrores.email = "Ingresá un correo electrónico válido.";
    }

    if (form.password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      nuevosErrores.password = "Debe incluir al menos una letra y un número.";
    }

    return nuevosErrores;
  };

  const handleSubmit = async () => {
    setError("");

    const nuevosErrores = validarFormulario();
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setError("Revisá los campos marcados en rojo.");
      return;
    }

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
      localStorage.clear();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("apellido", data.apellido);

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
      className="phone-container register-page"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <div className="register-top-section">
        <div className="bg-circle purple"></div>
        <div className="bg-circle orange"></div>

        <div className="register-logo">
          <div className="register-logo-badge">
            <span className="logo-c">C<span>+</span></span>
          </div>
          <span className="register-logo-text">changa<span>+</span></span>
        </div>

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
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={errores.nombre ? "input-error" : ""}
          />
          {errores.nombre && <span className="field-error">{errores.nombre}</span>}
        </div>

        <div className="input-group">
          <label>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            className={errores.apellido ? "input-error" : ""}
          />
          {errores.apellido && <span className="field-error">{errores.apellido}</span>}
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
            <input
              type="text"
              name="dia"
              placeholder="dd"
              value={form.dia}
              onChange={handleChange}
              className={errores.fecha ? "input-error" : ""}
            />
            <input
              type="text"
              name="mes"
              placeholder="mm"
              value={form.mes}
              onChange={handleChange}
              className={errores.fecha ? "input-error" : ""}
            />
            <input
              type="text"
              name="anio"
              placeholder="aaaa"
              value={form.anio}
              onChange={handleChange}
              className={errores.fecha ? "input-error" : ""}
            />
          </div>
          {errores.fecha && <span className="field-error">{errores.fecha}</span>}
        </div>

        <div className="input-group">
          <label>DNI / CUIT</label>
          <input
            type="text"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            className={errores.dni ? "input-error" : ""}
          />
          {errores.dni && <span className="field-error">{errores.dni}</span>}
        </div>

        <div className="input-group">
          <label>Provincia</label>
          <input
            type="text"
            name="provincia"
            value={form.provincia}
            onChange={handleChange}
            className={errores.provincia ? "input-error" : ""}
          />
          {errores.provincia && <span className="field-error">{errores.provincia}</span>}
        </div>

        <div className="street-row">
          <div className="input-group">
            <label>Calle</label>
            <input
              type="text"
              name="calle"
              value={form.calle}
              onChange={handleChange}
              className={errores.calle ? "input-error" : ""}
            />
            {errores.calle && <span className="field-error">{errores.calle}</span>}
          </div>
          <div className="input-group">
            <label>Número</label>
            <input
              type="text"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              className={errores.numero ? "input-error" : ""}
            />
            {errores.numero && <span className="field-error">{errores.numero}</span>}
          </div>
        </div>

        <div className="input-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={errores.email ? "input-error" : ""}
          />
          {errores.email && <span className="field-error">{errores.email}</span>}
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={errores.password ? "input-error" : ""}
          />
          {errores.password && <span className="field-error">{errores.password}</span>}
        </div>

        {error && <p className="form-error-banner">{error}</p>}

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
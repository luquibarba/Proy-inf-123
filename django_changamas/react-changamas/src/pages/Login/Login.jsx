import "./Login.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("Trabajador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email o contraseña incorrectos");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("apellido", data.apellido);

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
      className="phone-container login-page"
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <div className="login-top-section">
        <div className="bg-circle purple"></div>
        <div className="bg-circle orange"></div>

        <div className="login-logo">
          <div className="login-logo-badge">
            <span className="logo-c">C<span>+</span></span>
          </div>
          <span className="login-logo-text">changa<span>+</span></span>
        </div>

        <div className="welcome-card">
          <h1>Bienvenido<br />de nuevo</h1>
          <p>Inicia sesión para continuar</p>

          <div className="role-selector">
            <button
              className={`role ${selectedRole === "Trabajador" ? "active-login" : ""}`}
              onClick={() => setSelectedRole("Trabajador")}
            >
              Trabajador
            </button>
            <button
              className={`role ${selectedRole === "Cliente" ? "active-login" : ""}`}
              onClick={() => setSelectedRole("Cliente")}
            >
              Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="login-form">

        <div className="input-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <span className="forgot">¿Olvidaste tu contraseña?</span>

        {error && <p className="form-error-banner">{error}</p>}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={cargando}
        >
          {cargando ? "Ingresando..." : "Ingresar a mi cuenta"}
        </button>

        <div className="divider"><span>O</span></div>

        <p className="register-text">
          ¿No tienes cuenta?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
            Regístrate aquí
          </a>
        </p>

      </div>
    </motion.div>
  );
}

export default Login;
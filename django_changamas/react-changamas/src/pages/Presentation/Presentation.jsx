import "./Presentation.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Presentation() {
    const navigate = useNavigate();

    return (
        <div className="presentation-page">
            <div className="bg-circle purple"></div>
            <div className="bg-circle orange"></div>

            <motion.div
                className="presentation-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="presentation-top">
                    <motion.div
                        className="presentation-logo"
                        initial={{ scale: 0.6, opacity: 0, y: -40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <div className="logo-badge">
                            <span className="logo-c">
                                C<span>+</span>
                            </span>
                        </div>

                        <h1 className="logo-text">
                            changa<span>+</span>
                        </h1>

                        <div className="logo-line"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                    >
                        <p className="presentation-slogan">
                            Más oportunidades,
                            <br />
                            más trabajo,
                            <br />
                            <strong>más Changa.</strong>
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    className="presentation-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <div className="stat-item">
                        <span className="stat-number"> ~500</span>
                        <span className="stat-label">Trabajos por semana</span>
                    </div>

                    <div className="stat-divider"></div>

                    <div className="stat-item">
                        <span className="stat-number">
                            <span>+20</span>
                        </span>
                        <span className="stat-label">Provincias</span>
                    </div>

                    <div className="stat-divider"></div>

                    <div className="stat-item">
                        <span className="stat-number">+2500</span>
                        <span className="stat-label">Usuarios</span>
                    </div>
                </motion.div>

                <motion.div
                    className="presentation-buttons"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.6 }}
                >
                    <button className="start-btn" onClick={() => navigate("/register")}>
                        Empezar →
                    </button>

                    <button
                        className="login-btn-presentation"
                        onClick={() => navigate("/login")}
                    >
                        Ya tengo cuenta
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Presentation;
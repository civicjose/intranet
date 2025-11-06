import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../services/api";
import ErrorMessage from "../components/ErrorMessage";
import { FaSpinner } from "react-icons/fa";
import {
  MdOutlineMail,
  MdOutlineLock,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdArrowBack,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [view, setView] = useState("email");

  const {
    formData,
    setFormData,
    handleChange,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useForm({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { email, password, confirmPassword } = formData;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (token) {
      setView("reset");
    }
  }, [token]);

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/check-email", { email });
      if (response.data.status === "user_exists") {
        setView("password");
      } else if (response.data.status === "verification_sent") {
        navigate("/verify", { state: { email: email } });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo conectar con el servidor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", { email, password });

      // Si el backend devuelve correctamente el token
      if (response.data?.token) {
        await login(response.data.token); // Guardamos token y obtenemos usuario
        navigate("/dashboard"); // Redirige si lo deseas
      } else {
        throw new Error("Respuesta inválida del servidor: falta el token.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      // Captura cualquier tipo de error
      const mensaje =
        err.response?.data?.message ||
        err.message ||
        "Error al conectar con el servidor. Inténtalo de nuevo.";

      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPasswordSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToEmailView = () => {
    setView("email");
    setError("");
    setSuccessMessage("");
    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
  };

  const handleResetPasswordSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await apiClient.post(`/auth/reset-password/${token}`, {
        password,
      });
      setSuccessMessage(
        data.message + " Serás redirigido al login en 3 segundos."
      );

      setTimeout(() => {
        resetToEmailView();
        navigate("/", { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    switch (view) {
      case "email":
        handleEmailSubmit();
        break;
      case "password":
        handleLoginSubmit();
        break;
      case "forgot":
        handleForgotPasswordSubmit();
        break;
      case "reset":
        handleResetPasswordSubmit();
        break;
      default:
        break;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  };
  const contentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } },
  };
  const fieldVariants = {
    hidden: { opacity: 0, height: 0, y: 10 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const renderContent = () => {
    if (successMessage) {
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <p className="text-green-600 bg-green-50/80 p-4 rounded-md text-sm">
            {successMessage}
          </p>
          {view !== "reset" && (
            <button
              type="button"
              onClick={resetToEmailView}
              className="mt-4 inline-flex items-center gap-2 text-macrosad-pink font-semibold hover:underline"
            >
              <MdArrowBack /> Volver al inicio
            </button>
          )}
        </motion.div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {(view === "email" || view === "password" || view === "forgot") && (
            <motion.div
              key="email-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Correo Electrónico
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdOutlineMail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-4 py-3 transition ${
                    view === "password"
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : ""
                  } ${
                    error && (view === "email" || view === "forgot")
                      ? "border-red-500 ring-red-500"
                      : "border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink"
                  }`}
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleChange}
                  readOnly={view === "password"}
                  required
                  autoFocus={view !== "password"}
                />
              </div>
            </motion.div>
          )}

          {view === "password" && (
            <motion.div
              key="password-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdOutlineLock className="text-gray-400" size={20} />
                </div>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-10 py-3 transition ${
                    error && view === "password"
                      ? "border-red-500 ring-red-500"
                      : "border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink"
                  }`}
                  placeholder="Contraseña"
                  value={password}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="text-gray-500 hover:text-macrosad-pink"
                  >
                    {isPasswordVisible ? (
                      <MdOutlineVisibilityOff size={22} />
                    ) : (
                      <MdOutlineVisibility size={22} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "reset" && (
            <motion.div
              key="reset-fields"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <div className="relative">
                <label className="sr-only" htmlFor="password">
                  Nueva Contraseña
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdOutlineLock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Nueva Contraseña"
                  value={password}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-4 py-3 transition border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink"
                />
              </div>
              <div className="relative">
                <label className="sr-only" htmlFor="confirmPassword">
                  Confirmar Contraseña
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdOutlineLock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-4 py-3 transition border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <ErrorMessage message={error} />}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 bg-macrosad-pink text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 active:scale-95 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Cargando...</span>
              </>
            ) : view === "password" ? (
              "Iniciar Sesión"
            ) : view === "forgot" ? (
              "Enviar Enlace"
            ) : view === "reset" ? (
              "Guardar Contraseña"
            ) : (
              "Continuar"
            )}
          </button>
        </div>

        {view === "email" && <div className="h-10"></div>}

        <AnimatePresence>
          {view === "password" && (
            <motion.div
              key="forgot-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError("");
                }}
                className="text-sm text-macrosad-pink hover:underline font-medium"
              >
                ¿Has olvidado tu contraseña?
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(view === "forgot" || view === "password") && (
            <motion.div
              key="back-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <button
                type="button"
                onClick={() => resetToEmailView()}
                className="text-sm text-gray-500 hover:underline flex items-center justify-center w-full gap-1"
              >
                <MdArrowBack size={16} /> Volver
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-macrosad-purple to-macrosad-pink font-sans p-4 md:p-8">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl grid grid-cols-1 md:grid-cols-2"
        style={{ minHeight: "70vh" }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="col-span-1 relative h-64 md:h-auto bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=2832&auto=format&fit=crop')] flex flex-col items-center justify-center p-8 text-center">
          <div className="absolute inset-0 bg-macrosad-purple/70 backdrop-blur-sm"></div>
          <motion.div
            className="relative z-10 w-full space-y-4"
            variants={contentVariants}
          >
            <h1 className="text-5xl font-black text-white leading-tight">
              Conectando con tu Intranet
            </h1>
            <p className="text-xl text-white/90 font-light max-w-md mx-auto">
              Tu portal para el trabajo diario.
            </p>
          </motion.div>
        </div>
        <div className="col-span-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <motion.div
            className="w-full max-w-sm mx-auto"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-macrosad-purple">
                {view === "forgot"
                  ? "Recuperar Cuenta"
                  : view === "reset"
                  ? "Nueva Contraseña"
                  : "Acceso a la Intranet"}
              </h2>
              <p className="text-gray-500 font-medium text-sm tracking-wide">
                by Macrosad
              </p>
            </div>
            {renderContent()}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;

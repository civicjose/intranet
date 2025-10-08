import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import ErrorMessage from "../components/ErrorMessage";
import { FaSpinner } from "react-icons/fa";
import {
  MdOutlineLock,
  MdOutlinePerson,
  MdOutlineBadge,
  MdOutlineCorporateFare,
  MdOutlinePhone,
  MdOutlineCalendarToday,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";

// --- COMPONENTES AUXILIARES (sin cambios) ---
const InputField = ({ icon, children, ...props }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    <input
      {...props}
      className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-11 pr-12 py-3 transition ${
        props.className ||
        "border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink"
      }`}
    />
    {children}
  </div>
);

const PasswordProgressBar = ({ password }) => {
  // ...código sin cambios...
  const calculateStrength = () => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    return score;
  };
  const strength = calculateStrength();
  const strengthLabels = ["", "Débil", "Media", "Fuerte"];
  const strengthColors = [
    "bg-gray-200",
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const widthPercentage = strength > 0 ? (strength / 3) * 100 : 0;
  const checks = [
    { label: "8+ caracteres", valid: password.length >= 8 },
    { label: "Letras", valid: /[a-zA-Z]/.test(password) },
    { label: "Números", valid: /\d/.test(password) },
  ];
  return (
    <div className="mt-2 space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${strengthColors[strength]}`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {checks.map((check, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-0.5 rounded-full ${
                check.valid
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {check.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-right font-medium text-gray-600 flex-shrink-0 ml-2">
          {strengthLabels[strength]}
        </p>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
function CompleteProfilePage() {
  // --- LÓGICA Y ESTADOS (sin cambios) ---
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyPhone: "",
    birthDate: "",
  });
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);
  useEffect(() => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordMatchError("Las contraseñas no coinciden.");
    } else {
      setPasswordMatchError("");
    }
  }, [formData.password, formData.confirmPassword]);
  if (!email) return null;
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (passwordMatchError) return;
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/complete-registration", {
        email,
        ...formData,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al completar el registro."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-macrosad-purple to-macrosad-pink font-sans p-4">
      {/* Tarjeta con más padding vertical (py-10) */}
      <div className="bg-white px-8 py-10 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-macrosad-purple mb-8">
          Completa tu Perfil
        </h1>

        {/* Espaciado del formulario ajustado a space-y-8 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fieldset con padding-bottom para separar visualmente */}
          <fieldset className="border-t border-gray-200 pt-6 pb-4">
            <legend className="text-lg font-semibold text-gray-700 mb-4 px-2">
              Datos de Acceso
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <InputField
                  icon={<MdOutlineLock size={20} />}
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    passwordMatchError ? "border-red-500 ring-red-500" : ""
                  }
                  required
                >
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-macrosad-pink"
                  >
                    {isPasswordVisible ? (
                      <MdOutlineVisibilityOff size={22} />
                    ) : (
                      <MdOutlineVisibility size={22} />
                    )}
                  </button>
                </InputField>
              </div>
              <div>
                <InputField
                  icon={<MdOutlineLock size={20} />}
                  type={isConfirmVisible ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={
                    passwordMatchError ? "border-red-500 ring-red-500" : ""
                  }
                  required
                >
                  <button
                    type="button"
                    onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-macrosad-pink"
                  >
                    {isConfirmVisible ? (
                      <MdOutlineVisibilityOff size={22} />
                    ) : (
                      <MdOutlineVisibility size={22} />
                    )}
                  </button>
                </InputField>
                {passwordMatchError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {passwordMatchError}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <PasswordProgressBar password={formData.password} />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-t border-gray-200 pt-6">
            <legend className="text-lg font-semibold text-gray-700 mb-4 px-2">
              Datos Personales
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InputField
                icon={<MdOutlinePerson size={20} />}
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<MdOutlineBadge size={20} />}
                type="text"
                name="lastName"
                placeholder="Apellidos"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<MdOutlinePhone size={20} />}
                type="tel"
                name="companyPhone"
                placeholder="Teléfono de Empresa"
                value={formData.companyPhone}
                onChange={handleChange}
              />
              <InputField
                icon={<MdOutlineCalendarToday size={20} />}
                type="text"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                name="birthDate"
                placeholder="Fecha de Nacimiento"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* El mensaje de error general y el botón final tienen su propio contenedor */}
          <div className="pt-2 space-y-4">
            {error && <ErrorMessage message={error} />}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 bg-macrosad-pink text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 active:scale-95 transition duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Finalizando...</span>
                </>
              ) : (
                "Finalizar Registro"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfilePage;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

function VerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Recibimos el email

  const [code, setCode] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  // Efecto para redirigir si no hay email
  useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  // Efecto para la cuenta atrás
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  
  // Si no hay email, no renderizamos nada mientras se redirige
  if (!email) {
    return null; 
  }

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
        setError("El código debe tener 6 dígitos.");
        return;
    }
    
    try {
        const response = await apiClient.post('/auth/verify-code', { email, code: verificationCode });
        if (response.data.status === 'code_verified') {
            navigate('/complete-profile', { state: { email } });
        }
    } catch (err) {
        setError("Código incorrecto o expirado. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-macrosad-purple to-macrosad-pink font-sans p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-macrosad-purple mb-2">Verifica tu Correo</h1>
        <p className="text-gray-600 mb-6">Hemos enviado un código de 6 dígitos a <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {code.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macrosad-pink"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
                ref={el => inputsRef.current[index] = el}
              />
            ))}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-500">
              {timer > 0 ? `El código expira en ${Math.floor(timer / 60)}:${('0' + timer % 60).slice(-2)}` : "El código ha expirado."}
            </p>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button type="submit" className="w-full bg-macrosad-pink text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 shadow-lg">
            Verificar Cuenta
          </button>
        </form>
        
        <button disabled={timer > 0} className="mt-4 text-sm text-macrosad-pink disabled:text-gray-400 disabled:cursor-not-allowed hover:underline">
            ¿No recibiste el código? Reenviar
        </button>
      </div>
    </div>
  );
}

export default VerificationPage;
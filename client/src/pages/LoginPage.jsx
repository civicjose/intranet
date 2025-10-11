import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import { FaSpinner } from 'react-icons/fa';
import { MdOutlineMail, MdOutlineLock, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { formData, handleChange, isLoading, setIsLoading, error, setError } = useForm({
        email: '',
        password: ''
    });
    const { email, password } = formData;

    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleEmailSubmit = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/check-email', { email });
            if (response.data.status === 'user_exists') {
                setShowPassword(true);
            } else if (response.data.status === 'verification_sent') {
                navigate('/verify', { state: { email: email } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            await login(response.data.token);
            // La navegación al dashboard es automática gracias al AuthContext y App.jsx
        } catch (err) {
            setError('Contraseña incorrecta. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!showPassword) {
            handleEmailSubmit();
        } else {
            handleLoginSubmit();
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
    };
    const contentVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-macrosad-purple to-macrosad-pink font-sans p-4 md:p-8">
            <motion.div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl grid grid-cols-1 md:grid-cols-2"
                style={{ minHeight: '70vh' }}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="col-span-1 relative h-64 md:h-auto bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=2832&auto=format&fit=crop')] flex flex-col items-center justify-center p-8 text-center">
                    <div className="absolute inset-0 bg-macrosad-purple/70 backdrop-blur-sm"></div>
                    <motion.div className="relative z-10 w-full space-y-4" variants={contentVariants}>
                        <h1 className="text-5xl font-black text-white leading-tight">Conectando con tu Intranet</h1>
                        <p className="text-xl text-white/90 font-light max-w-md mx-auto">Tu portal para el trabajo diario.</p>
                    </motion.div>
                </div>
                <div className="col-span-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
                    <motion.div className="w-full max-w-sm mx-auto" variants={contentVariants} initial="hidden" animate="visible">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-macrosad-purple">Acceso a la Intranet</h2>
                            <p className="text-gray-500 font-medium text-sm tracking-wide">by Macrosad</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdOutlineMail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-4 py-3 transition ${showPassword ? 'cursor-not-allowed bg-gray-200 text-gray-500' : ''} ${error && !showPassword ? 'border-red-500 ring-red-500' : 'border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink'}`}
                                    placeholder="Correo Electrónico"
                                    value={email}
                                    onChange={handleChange}
                                    readOnly={showPassword}
                                    required
                                />
                            </div>

                            <AnimatePresence>
                                {showPassword && (
                                    <motion.div
                                        key="password-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="relative pt-4">
                                            <label htmlFor="password" className="sr-only">Contraseña</label>
                                            <div className="absolute inset-y-0 left-0 pl-3 pt-4 flex items-center pointer-events-none">
                                                <MdOutlineLock className="text-gray-400" size={20} />
                                            </div>
                                            <input
                                                type={isPasswordVisible ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 pl-10 pr-10 py-3 transition ${error && showPassword ? 'border-red-500 ring-red-500' : 'border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink'}`}
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={handleChange}
                                                required
                                                autoFocus
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 pt-4 flex items-center">
                                                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="text-gray-500 hover:text-macrosad-pink">
                                                    {isPasswordVisible ? <MdOutlineVisibilityOff size={22} /> : <MdOutlineVisibility size={22} />}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <div>
                                {error && <ErrorMessage message={error} />}
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-3 bg-macrosad-pink text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 active:scale-95 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? <><FaSpinner className="animate-spin" /><span>Cargando...</span></> : (showPassword ? 'Iniciar Sesión' : 'Continuar')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;
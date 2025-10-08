import { useEffect, useState } from 'react';

export const useInactivityTimeout = (logout, timeout = 600000) => { // Timeout por defecto de 10 minutos
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const resetTimer = () => {
      setLastActivity(Date.now());
    };

    // Añadimos los listeners para resetear el timer con cualquier actividad
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Comprobamos cada segundo si ha pasado el tiempo de inactividad
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeout) {
        logout();
      }
    }, 1000);

    // Limpiamos todo al desmontar el componente
    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [logout, timeout, lastActivity]);
};
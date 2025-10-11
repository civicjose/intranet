import { useEffect, useRef } from 'react';

// La firma de la función no cambia, pero sí su lógica interna
export const useInactivityTimeout = (logout, timeout = 900000, enabled = true) => { // Aumentado a 15 minutos por defecto
  // 1. Usamos useRef para guardar el tiempo de la última actividad.
  // useRef no causa re-renderizados y su valor es siempre el actual.
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    // 2. La función ahora actualiza la referencia, no un estado.
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    // Añadimos los listeners para la actividad del usuario
    events.forEach(event => window.addEventListener(event, resetTimer));

    // 3. El intervalo ahora comprueba contra la referencia, que siempre está actualizada.
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeout) {
        logout();
      }
    }, 5000); // Comprobamos cada 5 segundos, es más que suficiente y más eficiente

    // La función de limpieza se asegura de que todo se elimine correctamente
    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    
    // 4. El efecto ya no depende de 'lastActivity', por lo que no se reinicia innecesariamente.
  }, [logout, timeout, enabled]);
};
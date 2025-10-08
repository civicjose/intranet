import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';

function ErrorMessage({ message }) {
  // El componente ahora es un simple div que solo aparece si hay un mensaje.
  // La lógica de la animación y el espacio la controlaremos en la página de login.
  return (
    <div 
      className="flex items-center gap-3 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-lg border border-red-200"
      role="alert"
    >
      <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
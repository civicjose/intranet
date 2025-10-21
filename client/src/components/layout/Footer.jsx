// client/src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-center text-sm text-gray-500 py-4 px-6 border-t border-gray-200">
      <p>
        Desarrollado por <strong>Jose Cívico</strong> &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;
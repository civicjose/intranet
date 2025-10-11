// client/src/components/InputField.jsx
import React from 'react';

const InputField = ({ icon, children, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
    )}
    <input
      {...props}
      className={`w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 ${
        props.className || 'border-gray-200 focus:border-macrosad-pink focus:ring-macrosad-pink'
      }`}
    />
    {children}
  </div>
);

export default InputField;
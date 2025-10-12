import React from 'react';

const AdminPageLayout = ({ title, subtitle, buttonLabel, onButtonClick, children, secondaryButtonLabel, onSecondaryButtonClick }) => {
  return (
    <div>
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {secondaryButtonLabel && onSecondaryButtonClick && (
             <button onClick={onSecondaryButtonClick} className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-100">
                {secondaryButtonLabel}
            </button>
          )}
          {buttonLabel && onButtonClick && (
            <button onClick={onButtonClick} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
              {buttonLabel}
            </button>
          )}
        </div>
      </header>
      
      <div className="bg-light-card shadow-md rounded-lg overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminPageLayout;
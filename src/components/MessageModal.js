import React from 'react';

export default function MessageModal({ message, isOpen, onClose }) {
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center"><p className="text-lg text-gray-800 mb-4">{message}</p><button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Cerrar</button></div></div>);
}
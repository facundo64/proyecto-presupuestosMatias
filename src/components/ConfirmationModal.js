import React from 'react';

export default function ConfirmationModal({ message, isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center"><p className="text-lg text-gray-800 mb-6">{message}</p><div className="flex justify-center gap-4"><button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancelar</button><button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Confirmar</button></div></div></div>);
}
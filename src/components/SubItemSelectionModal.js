import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../assets/images/icons';

export default function SubItemSelectionModal({ product, isOpen, onClose, onConfirm }) {
    const [selectedSubItems, setSelectedSubItems] = useState({});

    useEffect(() => {
        if (product && product.subItems) {
            const initialSelection = product.subItems.reduce((acc, item) => {
                acc[item.name] = true; 
                return acc;
            }, {});
            setSelectedSubItems(initialSelection);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleToggle = (subItemName) => {
        setSelectedSubItems(prev => ({...prev, [subItemName]: !prev[subItemName]}));
    };

    const handleConfirm = () => {
        const itemsToConfirm = product.subItems.filter(item => selectedSubItems[item.name]);
        onConfirm(itemsToConfirm);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-lg w-full"><div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Seleccionar Servicios para "{product.name}"</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button></div><div className="p-6 max-h-96 overflow-y-auto">{product.subItems.map((item, index) => (<label key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"><div><span className="font-semibold">{item.name}</span><p className="text-sm text-gray-500">{item.description}</p></div><div className="flex items-center gap-4"><span className="text-gray-600">${parseFloat(item.value || 0).toFixed(2)}</span><input type="checkbox" checked={!!selectedSubItems[item.name]} onChange={() => handleToggle(item.name)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" /></div></label>))}</div><div className="p-6 bg-gray-50 rounded-b-lg flex justify-end"><button onClick={handleConfirm} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Confirmar Selección</button></div></div></div>
    );
}
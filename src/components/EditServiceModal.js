import React, { useState, useEffect } from 'react';
import { CloseIcon, TrashIcon } from '../assets/images/icons';

export default function EditServiceModal({ service, isOpen, onClose, onSave, setIsLoading }) {
   const [name, setName] = useState('');
   const [type, setType] = useState('simple');
   const [value, setValue] = useState('');
   const [description, setDescription] = useState('');
   const [subItems, setSubItems] = useState([]);

   useEffect(() => {
       if (service) {
           setName(service.name || '');
           setType(service.type || 'simple');
           setValue(service.value || '');
           setDescription(service.description || '');
           setSubItems(service.subItems ? service.subItems.map(item => ({...item, id: Math.random()})) : []);
       }
   }, [service]);

   if (!isOpen || !service) return null;

   const handleSubItemChange = (index, field, value) => {
       const updated = [...subItems];
       updated[index][field] = value;
       setSubItems(updated);
   };
   const addSubItem = () => setSubItems([...subItems, { id: Math.random(), name: '', description: '', value: '' }]);
   const removeSubItem = (index) => setSubItems(subItems.filter((_, i) => i !== index));

   const handleSave = async () => {
       setIsLoading(true);
       let updatedData = { name, type, description };
       if (type === 'simple') {
           updatedData.value = parseFloat(value) || 0;
       } else {
           updatedData.subItems = subItems
               .filter(item => item.name.trim() !== '') 
               .map(({id, ...rest}) => ({...rest, value: parseFloat(rest.value) || 0}));
       }
       await onSave(service.id, updatedData);
       onClose();
       setIsLoading(false);
   };

   return (
       <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-2xl w-full"><div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Servicio / Paquete</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button></div><div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
           <div><label className="block text-sm font-bold mb-2">Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required /></div>
           <div><label className="block text-sm font-bold mb-2">Tipo de Servicio</label><select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg bg-white"><option value="simple">Servicio Simple</option><option value="bundle">Paquete de Servicios</option></select></div>
           {type === 'simple' && <>
               <div><label className="block text-sm font-bold mb-2">Descripción</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg" rows="3"></textarea></div>
               <div><label className="block text-sm font-bold mb-2">Valor</label><input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 border rounded-lg" required /></div>
           </>}
           {type === 'bundle' && (<div><h3 className="font-semibold mb-2">Sub-ítems del Paquete</h3><div className="space-y-3">{subItems.map((item, index) => (
               <div key={item.id} className="p-3 border rounded-lg space-y-2 bg-gray-50"><div className="flex gap-2 items-start"><div className="flex-grow space-y-2"><input type="text" value={item.name} onChange={e => handleSubItemChange(index, 'name', e.target.value)} placeholder="Nombre del sub-ítem" className="w-full p-2 border rounded-lg" required/><textarea value={item.description} onChange={e => handleSubItemChange(index, 'description', e.target.value)} placeholder="Descripción del sub-ítem" className="w-full p-2 border rounded-lg" rows="2"></textarea><input type="number" value={item.value} onChange={e => handleSubItemChange(index, 'value', e.target.value)} placeholder="Valor" className="w-full p-2 border rounded-lg"/></div><button type="button" onClick={() => removeSubItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full mt-1"><TrashIcon/></button></div></div>
           ))}<button type="button" onClick={addSubItem} className="text-sm text-blue-600 hover:underline mt-3">+ Añadir sub-ítem</button></div></div>)}
       </div><div className="p-6 bg-gray-50 rounded-b-lg flex justify-end gap-4"><button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancelar</button><button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Guardar Cambios</button></div></div></div>
   );
}
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import MessageModal from '../components/MessageModal';
import SubItemSelectionModal from '../components/SubItemSelectionModal';
import { PlusIcon, SaveIcon, TrashIcon } from '../assets/images/icons';

export default function EditorView({ user, existingQuote, onSave, onCancel, setIsLoading }) {
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientContact, setClientContact] = useState('');
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [modalMessage, setModalMessage] = useState('');
    const [subItemModalOpen, setSubItemModalOpen] = useState(false);
    const [selectedProductForSubitems, setSelectedProductForSubitems] = useState(null);

    useEffect(() => {
        const path = `artifacts/${user.uid}/products`;
        const q = query(collection(db, path));
        const unsub = onSnapshot(q, (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, [user.uid]);

    useEffect(() => {
        if (existingQuote) {
            setClientName(existingQuote.clientName || '');
            setClientAddress(existingQuote.clientAddress || '');
            setClientContact(existingQuote.clientContact || '');
            setItems(
              existingQuote.items.map(item => ({
                ...item,
                id: Date.now() + Math.random(),
                showPrice: item.isPackage ? item.showPrice : (item.showPrice ?? true) // <-- para simples
              })) || []
            );
        } else {
             setItems([]);
        }
    }, [existingQuote]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubItemChange = (itemIndex, subIndex, field, value) => {
        const newItems = [...items];
        newItems[itemIndex].subItems[subIndex][field] = value;
        setItems(newItems);
    };

    const handleAddFromProduct = (product) => {
        if (!product) return;
        if (product.type === 'bundle') {
            setSelectedProductForSubitems(product);
            setSubItemModalOpen(true);
        } else {
            const newItem = {
                id: Date.now(),
                service: product.name,
                description: product.description,
                laborType: "Mano de Obra: Con Material",
                value: product.value || 0,
                isPackage: false,
                subItems: [],
                showPrice: true // SIEMPRE TRUE POR DEFECTO
            };
            setItems([...items, newItem]);
        }
    };

    const addBundleItemsToQuote = (selectedSubItems) => {
        const newItem = {
            id: Date.now(),
            service: selectedProductForSubitems.name,
            isPackage: true,
            laborType: 'Mano de Obra: Con Material',
            subItems: selectedSubItems.map(sub => ({...sub, id: Math.random()})),
            showSubItemPrices: true
        };
        setItems([...items, newItem]);
    };

    const addItem = () => setItems([
      ...items,
      {
        id: Date.now(),
        service: '',
        description: '',
        laborType: 'Mano de Obra: Con Material',
        value: 0,
        isPackage: false,
        subItems: [],
        showPrice: true // SIEMPRE TRUE POR DEFECTO
      }
    ]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const total = items.reduce((acc, item) => {
        if(item.isPackage) {
            const packageTotal = item.subItems.reduce((subAcc, sub) => subAcc + (parseFloat(sub.value) || 0), 0);
            return acc + packageTotal;
        }
        return acc + (parseFloat(item.value) || 0);
    }, 0);

    const handleSave = () => {
        if (!clientName.trim()) { 
            setModalMessage("Por favor, introduce el nombre del cliente.");
            return; 
        }
        const quoteData = { 
            clientName, clientAddress, clientContact,
            items: items.map(({ id, ...rest }) => rest), 
            total,
            userId: user.uid,
            createdAt: existingQuote?.createdAt || new Date(),
            updatedAt: new Date()
        };
        onSave(quoteData, !existingQuote);
    };

    return (
        <>
        <MessageModal isOpen={!!modalMessage} message={modalMessage} onClose={() => setModalMessage('')} />
        <SubItemSelectionModal product={selectedProductForSubitems} isOpen={subItemModalOpen} onClose={() => setSubItemModalOpen(false)} onConfirm={addBundleItemsToQuote} />
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto my-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{existingQuote ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientName">Nombre del Cliente</label><input id="clientName" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="Nombre Completo"/></div>
                <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientContact">Email o Teléfono</label><input id="clientContact" type="text" value={clientContact} onChange={(e) => setClientContact(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="contacto@cliente.com"/></div>
                <div className="md:col-span-2"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientAddress">Dirección</label><input id="clientAddress" type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="Calle, Número, Ciudad"/></div>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Ítems del Presupuesto</h3>
                <div className="space-y-4">
                    {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                        {item.isPackage ? (
                             <div className="p-3">
                                 <div className="flex justify-between items-center mb-2 bg-green-100 p-3 rounded-t-lg">
                                     <p className="font-bold text-lg text-green-800">{item.service}</p>
                                     <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>
                                 </div>
                                 <div className="space-y-2 p-3">
                                     {item.subItems.map((sub, subIndex) => (
                                         <div key={sub.id} className="grid grid-cols-[3fr,1fr] gap-2">
                                             <textarea value={sub.description} onChange={e => handleSubItemChange(index, subIndex, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2" placeholder="Descripción del sub-ítem"/>
                                             <input type="number" step="0.01" value={sub.value} onChange={e => handleSubItemChange(index, subIndex, 'value', e.target.value)} className="w-full p-2 border rounded text-right" placeholder="Valor"/>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="grid grid-cols-[2fr,1fr] gap-4 p-3 mt-2 bg-blue-100 rounded-b-lg items-center">
                                    <div className="flex items-center gap-4">
                                        <select value={item.laborType} onChange={e => handleItemChange(index, 'laborType', e.target.value)} className="w-full p-2 border rounded bg-white"><option>Mano de Obra: Con Material</option><option>Mano de Obra: Sin Material</option></select>
                                        <label className="flex items-center text-sm"><input type="checkbox" checked={item.showSubItemPrices} onChange={e => handleItemChange(index, 'showSubItemPrices', e.target.checked)} className="mr-2"/>Mostrar precios</label>
                                    </div>
                                    <p className="text-right font-bold text-lg">${item.subItems.reduce((acc, sub) => acc + (parseFloat(sub.value) || 0), 0).toFixed(2)}</p>
                                 </div>
                             </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 p-3" style={{backgroundColor: '#e0ffe0'}}>
                                    <input type="text" value={item.service} onChange={e => handleItemChange(index, 'service', e.target.value)} className="w-full p-2 border rounded font-semibold" placeholder="Servicio (ej: Hidráulica)" />
                                    <div className="flex items-center gap-2">
                                        <input type="number" step="0.01" value={item.value} onChange={e => handleItemChange(index, 'value', e.target.value)} className="w-full p-2 border rounded text-right" placeholder="Total del servicio" />
                                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 p-3" style={{backgroundColor: '#e0e0ff'}}>
                                    <textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2" placeholder="Descripción / Observaciones..." />
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Valor</span>
                                        <select value={item.laborType} onChange={e => handleItemChange(index, 'laborType', e.target.value)} className="w-full p-2 border rounded bg-white">
                                          <option>Mano de Obra: Con Material</option>
                                          <option>Mano de Obra: Sin Material</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[2fr,1fr] gap-4 p-3 mt-2 bg-blue-100 rounded-b-lg items-center">
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center text-sm">
                                      <input type="checkbox" checked={item.showPrice ?? true} onChange={e => handleItemChange(index, 'showPrice', e.target.checked)} className="mr-2" />
                                      Mostrar precios
                                    </label>
                                  </div>
                                  <p className="text-right font-bold text-lg">
                                    {item.showPrice ? `$${parseFloat(item.value || 0).toFixed(2)}` : '-'}
                                  </p>
                                </div>
                            </div>
                        )}
                    </div>
                    ))}
            </div>
            <div className="mt-4 flex gap-4">
                <button onClick={addItem} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg"><PlusIcon/> Añadir Ítem</button>
                 <select onChange={(e) => handleAddFromProduct(products.find(p => p.id === e.target.value))} className="p-2 border rounded-lg bg-gray-200" defaultValue="">
                    <option value="" disabled>Cargar Servicio o Paquete...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
        </div>
        <div className="flex justify-end mt-8"><div className="w-full max-w-sm"><div className="flex justify-between font-bold text-xl text-gray-800"><p>TOTAL A PAGAR:</p><p>${total.toFixed(2)}</p></div></div></div>
        <div className="mt-8 flex justify-end gap-4"><button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancelar</button><button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"><SaveIcon /> {existingQuote ? 'Actualizar' : 'Guardar'}</button></div>
    </div>
    </>
);
}
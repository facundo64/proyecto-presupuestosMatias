import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import MessageModal from '../components/MessageModal';
import SubItemSelectionModal from '../components/SubItemSelectionModal';
import { PlusIcon, SaveIcon, TrashIcon } from '../assets/images/icons';
// ¡Importante! Asegúrate de tener el archivo 'formatters.js' que creamos antes.
import { formatPrice } from '../utils/formatters';

export default function EditorView({ user, existingQuote, onSave, onCancel, setIsLoading }) {
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientContact, setClientContact] = useState('');
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [modalMessage, setModalMessage] = useState('');
    const [subItemModalOpen, setSubItemModalOpen] = useState(false);
    const [selectedProductForSubitems, setSelectedProductForSubitems] = useState(null);
    const [currency, setCurrency] = useState('ARS'); 
    const [exchangeRate, setExchangeRate] = useState(null);

    // --- EFECTOS (hooks de ciclo de vida) ---

    // Obtiene la lista de productos del usuario desde Firebase
    useEffect(() => {
        const path = `artifacts/${user.uid}/products`;
        const q = query(collection(db, path));
        const unsub = onSnapshot(q, (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, [user.uid]);

    // Obtiene la tasa de cambio del Dólar Blue al cargar el componente
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
                if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
                const data = await response.json();
                setExchangeRate(data.blue.value_sell);
            } catch (error) {
                console.error("Error al obtener la tasa de cambio:", error);
                setModalMessage("No se pudo obtener la tasa de cambio. Se usará un valor de respaldo.");
                setExchangeRate(1000); // Valor de respaldo por si falla la API
            }
        };
        fetchExchangeRate();
    }, []);

    // Carga los datos de un presupuesto existente o inicializa uno nuevo
    useEffect(() => {
        if (existingQuote) {
            setClientName(existingQuote.clientName || '');
            setClientAddress(existingQuote.clientAddress || '');
            setClientContact(existingQuote.clientContact || '');
            setCurrency(existingQuote.currency || 'ARS');
            setItems(
              existingQuote.items.map(item => ({
                ...item,
                id: Date.now() + Math.random(),
              })) || []
            );
        } else {
             setItems([]);
        }
    }, [existingQuote]);

    // --- MANEJADORES DE EVENTOS Y LÓGICA ---

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
    
    // Función para convertir todos los precios del presupuesto
    const handleCurrencyConversion = (targetCurrency) => {
        if (!exchangeRate) {
            setModalMessage("La tasa de cambio no está disponible. Intente de nuevo.");
            return;
        }
        if (currency === targetCurrency) return;

        const newItems = items.map(item => {
            const convertValue = (value) => {
                const numericValue = parseFloat(value) || 0;
                if (targetCurrency === 'USD' && currency === 'ARS') {
                    return numericValue / exchangeRate;
                }
                if (targetCurrency === 'ARS' && currency === 'USD') {
                    return numericValue * exchangeRate;
                }
                return numericValue;
            };

            const newItem = { ...item, value: convertValue(item.value) };
            if (item.subItems && item.subItems.length > 0) {
                newItem.subItems = item.subItems.map(sub => ({
                    ...sub,
                    value: convertValue(sub.value)
                }));
            }
            return newItem;
        });

        setItems(newItems);
        setCurrency(targetCurrency);
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
        showPrice: true
      }
    ]);

    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
    
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
                showPrice: true
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
            currency, // Guardamos la moneda actual
            userId: user.uid,
            createdAt: existingQuote?.createdAt || new Date(),
            updatedAt: new Date()
        };
        onSave(quoteData, !existingQuote);
    };

    // --- RENDERIZADO DEL COMPONENTE (JSX) ---

    return (
        <>
            <MessageModal isOpen={!!modalMessage} message={modalMessage} onClose={() => setModalMessage('')} />
            <SubItemSelectionModal product={selectedProductForSubitems} isOpen={subItemModalOpen} onClose={() => setSubItemModalOpen(false)} onConfirm={addBundleItemsToQuote} />
            
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto my-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{existingQuote ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
                
                {/* Datos del Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientName">Nombre del Cliente</label><input id="clientName" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="Nombre Completo"/></div>
                    <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientContact">Email o Teléfono</label><input id="clientContact" type="text" value={clientContact} onChange={(e) => setClientContact(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="contacto@cliente.com"/></div>
                    <div className="md:col-span-2"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientAddress">Dirección</label><input id="clientAddress" type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" placeholder="Calle, Número, Ciudad"/></div>
                </div>

                {/* Sección de Ítems */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Ítems del Presupuesto</h3>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                            {item.isPackage ? (
                                // --- VISTA PARA PAQUETES ---
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
                                            <select value={item.laborType} onChange={e => handleItemChange(index, 'laborType', e.target.value)} className="w-full p-2 border rounded bg-white">
                                                <option>Mano de Obra: Con Material</option>
                                                <option>Mano de Obra: Sin Material</option>
                                                <option>Mano de Obra: Con Material Hidráulico</option>
                                            </select>
                                            <label className="flex items-center text-sm whitespace-nowrap"><input type="checkbox" checked={item.showSubItemPrices} onChange={e => handleItemChange(index, 'showSubItemPrices', e.target.checked)} className="mr-2"/>Mostrar precios</label>
                                        </div>
                                        <p className="text-right font-bold text-lg">
                                            {formatPrice(item.subItems.reduce((acc, sub) => acc + (parseFloat(sub.value) || 0), 0), currency)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // --- VISTA PARA ÍTEMS SIMPLES ---
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
                                            <span className="font-semibold">Tipo:</span>
                                            <select value={item.laborType} onChange={e => handleItemChange(index, 'laborType', e.target.value)} className="w-full p-2 border rounded bg-white">
                                                <option>Mano de Obra: Con Material</option>
                                                <option>Mano de Obra: Sin Material</option>
                                                <option>Mano de Obra: Con Material Hidráulico</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[2fr,1fr] gap-4 p-3 mt-2 bg-blue-100 rounded-b-lg items-center">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center text-sm"><input type="checkbox" checked={item.showPrice ?? true} onChange={e => handleItemChange(index, 'showPrice', e.target.checked)} className="mr-2" />Mostrar precios</label>
                                        </div>
                                        <p className="text-right font-bold text-lg">
                                            {item.showPrice ? formatPrice(item.value, currency) : '-'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                    
                    {/* Botones de Acción y Conversión de Moneda */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                        <div className="flex items-center gap-4">
                            <button onClick={addItem} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg"><PlusIcon/> Añadir Ítem</button>
                            <select onChange={(e) => handleAddFromProduct(products.find(p => p.id === e.target.value))} className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200" defaultValue="">
                                <option value="" disabled>Cargar Servicio o Paquete...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600">Convertir a:</span>
                            <button onClick={() => handleCurrencyConversion('ARS')} disabled={currency === 'ARS' || !exchangeRate} className="px-3 py-2 text-sm font-bold text-white bg-green-600 rounded-lg disabled:bg-gray-400 hover:bg-green-700">ARS</button>
                            <button onClick={() => handleCurrencyConversion('USD')} disabled={currency === 'USD' || !exchangeRate} className="px-3 py-2 text-sm font-bold text-white bg-blue-500 rounded-lg disabled:bg-gray-400 hover:bg-blue-600">USD</button>
                            {exchangeRate && <span className="text-xs text-gray-500">(1 USD ≈ {exchangeRate.toFixed(2)} ARS)</span>}
                        </div>
                    </div>
                </div>
                
                {/* Total y Botones Finales */}
                <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between font-bold text-xl text-gray-800 bg-gray-100 p-4 rounded-lg">
                            <span>TOTAL ({currency}):</span>
                            <span>{formatPrice(total, currency)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"><SaveIcon /> {existingQuote ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        </>
    );
}
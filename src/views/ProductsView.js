import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import EditServiceModal from '../components/EditServiceModal';
import { PlusIcon, TrashIcon, EditIcon } from '../assets/images/icons';

export default function ProductsView({ user, setView, setIsLoading }) {
    const [products, setProducts] = useState([]);
    const [editingService, setEditingService] = useState(null);
    const productsCollectionPath = `artifacts/${user.uid}/products`;

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, productsCollectionPath));
        const unsubscribe = onSnapshot(q, (snapshot) => { 
            const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            prods.sort((a,b) => a.name.localeCompare(b.name));
            setProducts(prods); 
            setIsLoading(false); 
        }, (err) => { 
            console.error(err);
            setIsLoading(false); 
        });
        return () => unsubscribe();
    }, [user.uid, setIsLoading, productsCollectionPath]);
        
    const handleDeleteProduct = async (productId) => {
        setIsLoading(true);
        try { 
            await deleteDoc(doc(db, productsCollectionPath, productId)); 
        } catch (error) { 
            console.error("Error al eliminar: ", error); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleSaveService = async (serviceId, serviceData) => {
        setIsLoading(true);
        try {
            if (serviceId) {
                await updateDoc(doc(db, productsCollectionPath, serviceId), serviceData);
            } else {
                await addDoc(collection(db, productsCollectionPath), serviceData);
            }
        } catch (error) {
            console.error("Error guardando el servicio:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNew = () => {
        setEditingService({ 
            id: null, // Importante para diferenciar entre nuevo y edición
            name: '', 
            type: 'simple', 
            value: '', 
            description: '', 
            subItems: [] 
        });
    };

    return (
        <>
            <EditServiceModal 
                isOpen={!!editingService} 
                service={editingService} 
                onClose={() => setEditingService(null)} 
                onSave={handleSaveService} 
                setIsLoading={setIsLoading}
            />
            <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Gestionar Servicios y Paquetes</h1>
                    <button onClick={() => setView('dashboard')} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Volver</button>
                </header>
                <div className="mb-8">
                    <button onClick={handleNew} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                        <PlusIcon/> Añadir Nuevo Servicio o Paquete
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <h2 className="text-xl font-semibold p-6">Mi Lista</h2>
                    <ul className="divide-y divide-gray-200">
                        {products.map(p => ( 
                            <li key={p.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{p.name} <span className={`text-xs font-normal px-2 py-1 rounded-full ${p.type === 'bundle' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>{p.type === 'bundle' ? 'Paquete' : 'Simple'}</span></p>
                                    {p.type === 'simple' && <p className="text-gray-600">${parseFloat(p.value).toFixed(2)}</p>}
                                    {p.type === 'bundle' && p.subItems && <p className="text-sm text-gray-500">{p.subItems.length} sub-ítems</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingService(p)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600"><EditIcon/></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-full hover:bg-red-100 text-red-600"><TrashIcon/></button>
                                </div>
                            </li> 
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
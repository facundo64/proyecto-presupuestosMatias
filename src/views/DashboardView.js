import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { PlusIcon, BoxIcon, EyeIcon, EditIcon, TrashIcon, SearchIcon } from '../assets/images/icons';
import ConfirmationModal from '../components/ConfirmationModal';

export default function DashboardView({ user, setView, setSelectedQuote, setIsLoading }) {
    const [quotes, setQuotes] = useState([]);
    const [quoteToDelete, setQuoteToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        const path = `artifacts/${user.uid}/quotes`;
        const q = query(collection(db, path));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.quoteNumber || 0) - (a.quoteNumber || 0));
            setQuotes(data);
            setIsLoading(false);
        }, (err) => { console.error(err); setIsLoading(false); });
        return () => unsub();
    }, [user, setIsLoading]);

    const handleSignOut = async () => { await signOut(auth); };
    const handleEdit = (quote) => { setSelectedQuote(quote); setView('editor'); };
    const handlePreview = (quote) => { setSelectedQuote(quote); setView('preview'); };
    const handleDelete = async () => {
        if (!quoteToDelete) return;
        setIsLoading(true);
        try { await deleteDoc(doc(db, `artifacts/${user.uid}/quotes/${quoteToDelete}`)); }
        catch (error) { console.error(error); }
        finally { setQuoteToDelete(null); setIsLoading(false); }
    };

    const filteredQuotes = quotes.filter(quote => {
        const term = searchTerm.toLowerCase();
        const quoteNum = String(quote.quoteNumber).padStart(5, '0');
        return quote.clientName.toLowerCase().includes(term) || quoteNum.includes(term);
    });

    return (
        <>
        <ConfirmationModal 
            isOpen={!!quoteToDelete} 
            message="¿Estás seguro de que quieres eliminar este presupuesto?"
            onConfirm={handleDelete}
            onCancel={() => setQuoteToDelete(null)}
        />
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"><div><h1 className="text-3xl font-bold text-gray-800">Mis Presupuestos</h1><p className="text-sm text-gray-500">ID Usuario: {user.uid}</p></div><div className="flex items-center flex-wrap gap-2"><button onClick={() => setView('products')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><BoxIcon/> Gestionar Servicios</button><button onClick={() => { setSelectedQuote(null); setView('editor'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon/> Nuevo Presupuesto</button><button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Salir</button></div></header>
            <div className="mb-6"><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon/></span><input type="text" placeholder="Buscar por cliente o N° de presupuesto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">{filteredQuotes.length > 0 ? ( <ul className="divide-y divide-gray-200">{filteredQuotes.map(quote => ( <li key={quote.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3"><div><p className="font-semibold text-lg text-gray-900">N°{String(quote.quoteNumber).padStart(5, '0')} - {quote.clientName}</p><p className="text-gray-600">Total: ${quote.total.toFixed(2)}</p><p className="text-sm text-gray-400">Modificado: {new Date(quote.updatedAt.seconds * 1000).toLocaleString()}</p></div><div className="flex gap-2 self-end sm:self-center"><button onClick={() => handlePreview(quote)} title="Ver Presupuesto" className="p-2 rounded-full hover:bg-green-100 text-green-600"><EyeIcon /></button><button onClick={() => handleEdit(quote)} title="Editar" className="p-2 rounded-full hover:bg-blue-100 text-blue-600"><EditIcon /></button><button onClick={() => setQuoteToDelete(quote.id)} title="Eliminar" className="p-2 rounded-full hover:bg-red-100 text-red-600"><TrashIcon /></button></div></li> ))}</ul> ) : ( <div className="text-center py-16 px-4"><h3 className="text-xl font-semibold text-gray-700">No se encontraron presupuestos.</h3><p className="text-gray-500 mt-2">Intenta con otra búsqueda o crea un nuevo presupuesto.</p></div> )}</div>
        </div>
        </>
    );
}
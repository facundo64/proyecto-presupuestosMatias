import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, runTransaction, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';

// Vistas
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import EditorView from './views/EditorView';
import ProductsView from './views/ProductsView';
import PreviewView from './views/PreviewView';

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [view, setView] = useState('auth'); 
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setView('dashboard');
            } else {
                setUser(null);
                setView('auth');
            }
            setIsAuthReady(true);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveQuote = async (quoteData, isNew) => {
        setIsLoading(true);
        try {
            const basePath = `artifacts/${user.uid}`;
            if (isNew) {
                const counterRef = doc(db, `${basePath}/metadata`, 'quoteCounter');
                const newQuoteRef = doc(collection(db, `${basePath}/quotes`));
                
                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    const newCount = (counterDoc.data()?.count || 0) + 1;
                    transaction.set(newQuoteRef, { ...quoteData, quoteNumber: newCount });
                    transaction.set(counterRef, { count: newCount }, { merge: true });
                });
            } else {
                const quoteRef = doc(db, `${basePath}/quotes`, selectedQuote.id);
                await updateDoc(quoteRef, quoteData);
            }
            setView('dashboard');
            setSelectedQuote(null);
        } catch (error) {
            console.error("Error guardando el presupuesto:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const Loader = () => (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div></div>);

    const renderContent = () => {
        if (!isAuthReady) return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><p className="text-xl font-semibold">Cargando aplicación...</p></div>;
        if (!user) return <AuthView setIsLoading={setIsLoading}/>;
        
        switch(view) {
            case 'dashboard': return <DashboardView user={user} setView={setView} setSelectedQuote={setSelectedQuote} setIsLoading={setIsLoading} />;
            case 'editor': return <EditorView user={user} existingQuote={selectedQuote} onSave={handleSaveQuote} onCancel={() => { setView('dashboard'); setSelectedQuote(null); }} setIsLoading={setIsLoading} />;
            case 'products': return <ProductsView user={user} setView={setView} setIsLoading={setIsLoading} />;
            case 'preview': return <PreviewView quote={selectedQuote} setView={setView} />;
            default: return <DashboardView user={user} setView={setView} setSelectedQuote={setSelectedQuote} setIsLoading={setIsLoading} />;
        }
    };

    return (<div className="bg-gray-100 min-h-screen font-sans">{isLoading && <Loader />}{renderContent()}</div>);
}

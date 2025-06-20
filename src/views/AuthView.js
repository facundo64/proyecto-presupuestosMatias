import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ReactComponent as Logo } from '../assets/images/obra-azul-horizontal.svg';

export default function AuthView({ setIsLoading }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const auth = getAuth();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError("Por favor, introduce tu email para restablecer la contraseña.");
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Se ha enviado un enlace para restablecer la contraseña a tu correo.");
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setIsLoading(false);
        }
    };

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email o contraseña incorrectos.';
            case 'auth/email-already-in-use':
                return 'Este correo electrónico ya está en uso.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
            case 'auth/invalid-email':
                return 'El formato del correo no es válido.';
            default:
                return 'Ocurrió un error. Por favor, inténtalo de nuevo.';
        }
    };

    return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
             <div className="flex justify-center">
                 <Logo className="w-40 h-auto" />
             </div>
             <h2 className="text-2xl font-bold text-center text-gray-800">
                {isLoginView ? 'Acceso a la Plataforma' : 'Crear Nueva Cuenta'}
             </h2>
             <form className="space-y-6" onSubmit={handleAuthAction}>
                 <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                     <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="tu@email.com"
                    />
                 </div>
                 <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                     <input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="••••••••"
                    />
                 </div>
                 {isLoginView && (
                    <div className="flex justify-end text-sm">
                        <button type="button" onClick={handlePasswordReset} className="font-semibold text-blue-600 hover:underline">¿Olvidaste tu contraseña?</button>
                    </div>
                 )}
                 {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                 {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                 <div>
                     <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                         {isLoginView ? 'Iniciar Sesión' : 'Registrar'}
                     </button>
                 </div>
             </form>
             <p className="text-center text-sm text-gray-500">
                {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button type="button" onClick={() => { setIsLoginView(!isLoginView); setError(''); setMessage(''); }} className="font-semibold text-blue-600 hover:underline ml-1">
                    {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                </button>
            </p>
         </div>
     </div>
    );
}
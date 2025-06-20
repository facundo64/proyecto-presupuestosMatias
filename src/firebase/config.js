import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Tus credenciales de Firebase que ya configuraste
const firebaseConfig = {
    apiKey: "AIzaSyC8MHpzuX11_GEGa5LfT7U53mQjMp7V6Hk",
    authDomain: "obra-azul-presupuestos.firebaseapp.com",
    projectId: "obra-azul-presupuestos",
    storageBucket: "obra-azul-presupuestos.appspot.com",
    messagingSenderId: "255855729982",
    appId: "1:255855729982:web:151f3d6ddb728a8b9f606f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

export { db, auth };
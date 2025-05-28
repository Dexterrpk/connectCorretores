// services.js - Serviços da aplicação Connect Corretores
// Este arquivo contém os serviços para interação com Firebase

import { auth, db, storage, collections, utils } from './config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    deleteDoc,

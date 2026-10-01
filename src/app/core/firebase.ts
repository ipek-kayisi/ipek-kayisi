import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  firebase: {
    apiKey: 'AIzaSyDY9UeVSNrgDFiC4DgwKmvq3D1nhAjn4z8',
    authDomain: 'ipek-malatya.firebaseapp.com',
    projectId: 'ipek-malatya',
    storageBucket: 'ipek-malatya.firebasestorage.app',
    messagingSenderId: '879513566205',
    appId: '1:879513566205:web:88c943e809942aba78f794',
  },
};

export const firebaseConfigured = !firebaseConfig.firebase.apiKey.startsWith('YOUR_');
export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig.firebase);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

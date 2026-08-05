import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: rawConfig?.projectId || 'demo-project',
  appId: rawConfig?.appId || '1:123456789:web:123456789',
  apiKey: rawConfig?.apiKey || 'AIzaSyDummyKeyForVSCodeTesting',
  authDomain: rawConfig?.authDomain || '',
  storageBucket: rawConfig?.storageBucket || '',
  messagingSenderId: rawConfig?.messagingSenderId || '',
  ...rawConfig
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

// Suppress transient offline/connection error noise
setLogLevel('error');

export const auth = getAuth(app);
export default app;

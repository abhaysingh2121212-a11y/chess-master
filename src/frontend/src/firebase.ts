// Firebase configuration
// NOTE: These are placeholder credentials for demo purposes.
// Replace with real Firebase project credentials to enable authentication.
export const FIREBASE_DEMO_MODE = true;

export const firebaseConfig = {
  apiKey: "AIzaSyDemo-placeholder-replace-with-real",
  authDomain: "chess-master-demo.firebaseapp.com",
  projectId: "chess-master-demo",
  storageBucket: "chess-master-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Since this is demo mode, we export a null auth object.
// The useAuth hook will use a local mock implementation.
export const auth = null;
export const googleProvider = null;
export default null;

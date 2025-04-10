import { initializeApp, getApps } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialiser Firebase seulement si les variables d'environnement sont disponibles
// et si l'application n'a pas déjà été initialisée
let app
let auth: Auth
let db: Firestore

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    console.log("Firebase initialisé avec succès")
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error)
  }
} else {
  // Si Firebase est déjà initialisé, récupérer les instances existantes
  if (getApps().length > 0) {
    app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    console.warn("Firebase n'a pas pu être initialisé. Variables d'environnement manquantes ou environnement serveur.")
    // Créer des objets fictifs pour éviter les erreurs
    auth = {} as Auth
    db = {} as Firestore
  }
}

export { auth, db }

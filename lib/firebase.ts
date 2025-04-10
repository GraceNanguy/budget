import { initializeApp, getApps } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA84Uvm4BCqmKsfELjadijywIx47Rwljtc",
  authDomain: "gestion-budget-perso.firebaseapp.com",
  projectId: "gestion-budget-perso",
  storageBucket: "gestion-budget-perso.appspot.com",
  messagingSenderId: "398168722237",
  appId: "1:398168722237:web:bbe4bbc79d59d65beed354",
}

// Initialiser Firebase seulement si les variables d'environnement sont disponibles
// et si l'application n'a pas déjà été initialisée
let app
let auth: Auth
let db: Firestore

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.error("Erreur lors de l'initialisation de Firebase:", error)
  // Créer des objets fictifs pour éviter les erreurs
  auth = {} as Auth
  db = {} as Firestore
}

export { auth, db }

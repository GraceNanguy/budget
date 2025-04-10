"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
        router.push("/dashboard");
      } else {
        // Sinon, rediriger vers la page de chargement puis onboarding
        router.push("/loading");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Cette page ne sera pas visible car la redirection se fait immédiatement
  return null;
}
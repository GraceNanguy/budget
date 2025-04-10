"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, PiggyBank, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
        router.push('/dashboard')
      } else {
        // Sinon, afficher l'onboarding
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const onboardingSteps = [
    {
      icon: <PiggyBank className="h-24 w-24 text-primary" />,
      title: "Suivez vos dépenses",
      description: "Enregistrez facilement vos dépenses et revenus pour garder une trace de votre argent.",
    },
    {
      icon: <TrendingUp className="h-24 w-24 text-primary" />,
      title: "Atteignez vos objectifs",
      description: "Créez des budgets et recevez des alertes pour rester dans les limites que vous vous êtes fixées.",
    },
  ]

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1)
    } else {
      router.push("/auth")
    }
  }

  // Si on vérifie encore l'authentification, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center max-w-md w-full"
        >
          <div className="mb-8">{onboardingSteps[step].icon}</div>
          <h1 className="text-2xl font-bold text-center mb-4">{onboardingSteps[step].title}</h1>
          <p className="text-gray-600 text-center mb-8">{onboardingSteps[step].description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center mt-8">
        {onboardingSteps.map((_, index) => (
          <div key={index} className={`w-2 h-2 rounded-full mx-1 ${index === step ? "bg-primary" : "bg-gray-300"}`} />
        ))}
      </div>

      <Button onClick={handleNext} className="mt-12 px-8">
        {step < onboardingSteps.length - 1 ? (
          <>
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          "Commencer"
        )}
      </Button>
    </div>
  )
}

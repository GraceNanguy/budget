"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from "@/lib/firebase"
import { updateProfile, updateEmail, updatePassword } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setDisplayName(user.displayName || "")
      setEmail(user.email || "")
      setUserName(user.displayName || user.email?.split("@")[0] || "Utilisateur")
    }
  }, [])

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.currentUser) return

    setIsLoading(true)

    try {
      // Update display name
      if (displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName,
        })
      }

      // Update email
      if (email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email)
      }

      // Update password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas")
        }
        await updatePassword(auth.currentUser, newPassword)
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      })

      // Reset password fields
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav userName={userName} />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:gap-8 max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-semibold">{displayName || email}</h2>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                  />
                </div>
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-4">Modifier le mot de passe</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

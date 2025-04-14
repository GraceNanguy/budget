"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Bell, Wallet, User, BarChart2, DollarSign, CreditCard, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MainNavProps {
  notificationCount?: number
  userName?: string
}

export function MainNav({ notificationCount = 0, userName = "Utilisateur" }: MainNavProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      })
      // Redirection après un court délai pour permettre à l'état de se mettre à jour
      setTimeout(() => {
        router.push("/auth")
      }, 300)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      })
    }
  }

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const menuItems = [
    { icon: <User className="mr-2 h-5 w-5" />, label: "Profil", href: "/profile" },
    { icon: <BarChart2 className="mr-2 h-5 w-5" />, label: "Statistiques", href: "/statistics" },
    { icon: <Wallet className="mr-2 h-5 w-5" />, label: "Budgets", href: "/budgets" },
    { icon: <DollarSign className="mr-2 h-5 w-5" />, label: "Revenus", href: "/income" },
    { icon: <CreditCard className="mr-2 h-5 w-5" />, label: "Dépenses", href: "/expenses" },
    { icon: <FileText className="mr-2 h-5 w-5" />, label: "Rapports", href: "/reports" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu principal</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:w-72">
            <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-2 px-2">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Budget Manager</span>
              </div>

              <div className="flex items-center gap-3 px-2 pb-2 border-b">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userName}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center rounded-md px-2 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center rounded-md px-2 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex justify-center">
          <Link href="/dashboard" className="flex items-center">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold hidden sm:inline-block">Budget Manager</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

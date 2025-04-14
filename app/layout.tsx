import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Head from 'next/head'


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Budget Manager",
  description: "Gérez votre budget personnel facilement",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <Head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#000000" />
</Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'
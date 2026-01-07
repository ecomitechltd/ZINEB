import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "eSIMFly - Instant eSIM for Global Travelers",
  description: "Get connected anywhere in the world with instant eSIM data plans. No physical SIM needed. Works in 190+ countries.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EchoSense | Next-Gen Music Recognition',
  description: 'Beautiful music intelligence dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <main className="min-h-screen container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
        <div className="fixed bottom-4 left-0 right-0 text-center text-sm font-light text-gray-500/60 pointer-events-none z-50">
          made by debatreya and subhro
        </div>
      </body>
    </html>
  )
}

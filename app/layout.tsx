import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'EasyPass - Service Request Tracker',
  description: 'Service request management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden">
        <main className="relative">
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'glass-card !rounded-2xl !p-4 !shadow-xl',
            duration: 3000,
          }}
        />
      </body>
    </html>
  )
}

// app/layout.tsx
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
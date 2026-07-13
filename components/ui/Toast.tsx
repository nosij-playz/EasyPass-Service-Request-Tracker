// components/ui/Toast.tsx
'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid #D1FAE5',
            background: '#F0FDF4',
            color: '#065F46',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid #FEE2E2',
            background: '#FEF2F2',
            color: '#991B1B',
          },
        },
      }}
    />
  )
}
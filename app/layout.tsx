import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import StoreProvider from '@/lib/redux/provider'
import { ProtectedWrapper } from '@/components/layout/protected-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Modern HR Management Dashboard - Employee Management, Payroll, Recruitment & More',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <StoreProvider>
          <ProtectedWrapper>{children}</ProtectedWrapper>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

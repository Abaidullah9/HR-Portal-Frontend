import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import StoreProvider from '@/lib/redux/provider'
import { ProtectedWrapper } from '@/components/layout/protected-wrapper'
import { LanguageProvider } from '@/lib/i18n'
import { ServiceWorkerRegister } from '@/components/layout/service-worker-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Modern HR Management Dashboard - Employee Management, Payroll, Recruitment & More',
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
  themeColor: '#080d1a',
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

/**
 * Applies the stored palette before paint so the app never flashes the wrong
 * theme. Light palettes ("slate") drop the `dark` class, dark palettes add it.
 */
const paletteInitScript = `(function(){try{
var stored=localStorage.getItem('hr-palette');
if(!stored){var legacy=localStorage.getItem('theme');stored=legacy?(legacy==='light'?'slate':'midnight'):((window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'slate':'midnight');}
var root=document.documentElement;
root.setAttribute('data-palette',stored);
if(stored==='slate'){root.classList.remove('dark');}else{root.classList.add('dark');}
var bg={'midnight':'#080d1a','indigo':'#0c0d18','slate':'#ffffff','emerald':'#0a0f0d'}[stored];
if(bg){var metas=document.querySelectorAll('meta[name="theme-color"]');
for(var i=0;i<metas.length;i++){metas[i].setAttribute('content',bg);}}
}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-palette="midnight" className="dark bg-background" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteInitScript }} />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <StoreProvider>
            <ProtectedWrapper>{children}</ProtectedWrapper>
          </StoreProvider>
        </LanguageProvider>
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

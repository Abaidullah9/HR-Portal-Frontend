import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HR Portal',
    short_name: 'HR Portal',
    description: 'Employee management, attendance, leave, payroll and performance in one place.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080d1a',
    theme_color: '#080d1a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}

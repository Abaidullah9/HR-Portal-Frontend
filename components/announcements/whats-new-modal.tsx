'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CURRENT_VERSION = '2.0.0'
const STORAGE_KEY = 'whats-new-dismissed-version'

interface Feature {
  title: string
  description: string
  icon: 'sparkles' | 'zap' | 'rocket'
}

const features: Feature[] = [
  {
    title: 'New Dashboard Design',
    description: 'Completely redesigned dashboard with better insights and modern UI',
    icon: 'sparkles',
  },
  {
    title: 'Advanced Filtering',
    description: 'Powerful filtering options across all modules for better data management',
    icon: 'zap',
  },
  {
    title: 'Performance Improvements',
    description: 'Lightning-fast load times and smoother interactions throughout the app',
    icon: 'rocket',
  },
  {
    title: 'Dark Mode Support',
    description: 'Seamless dark mode experience for comfortable viewing',
    icon: 'sparkles',
  },
]

const iconComponents = {
  sparkles: Sparkles,
  zap: () => null,
  rocket: () => null,
}

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const dismissedVersion = localStorage.getItem(STORAGE_KEY)
    if (dismissedVersion !== CURRENT_VERSION) {
      // Delay modal opening for better UX
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative p-8 text-center border-b border-border">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="text-primary" size={32} />
                <div
                  className="absolute inset-0 border-2 border-primary/20 rounded-full animate-pulse"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">What&apos;s New</h2>
            <p className="text-sm text-muted-foreground">
              Version {CURRENT_VERSION} brings exciting updates
            </p>
          </div>

          {/* Features */}
          <div className="p-6 space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border space-y-3">
            <Button
              onClick={() => window.open('https://blog.example.com/v2', '_blank')}
              variant="outline"
              className="w-full"
            >
              Learn More
            </Button>
            <Button onClick={handleDismiss} className="w-full">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

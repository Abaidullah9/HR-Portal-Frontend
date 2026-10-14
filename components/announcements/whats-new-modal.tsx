'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

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
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setIsOpen(false)
  }

  // Dialog keyboard behaviour: focus trap, Escape, scroll lock, focus restore.
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose: handleDismiss })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whats-new-title"
          className="w-full max-w-md overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
        >
          {/* Header */}
          <div className="mb-6 border-b edge pb-6 text-center">
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5 shadow-lg shadow-black/20">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 animate-pulse" />
                <div className="absolute inset-0 rounded-full border" />
                <Sparkles className="relative brand-text" size={30} strokeWidth={2} />
              </div>
            </div>

            <h2 id="whats-new-title" className="text-2xl font-bold text-foreground">
              What&apos;s New
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Version {CURRENT_VERSION} brings exciting updates
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 overflow-hidden rounded-xl border edge bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-x-1 hover:shadow-md dark:surface-50"
              >
                <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Sparkles size={18} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-xs text-foreground/65">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 border-t edge pt-6 flex gap-3">
            <a
              href="https://blog.example.com/v2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center rounded-xl border edge bg-white/80 px-4 text-sm text-foreground hover:bg-white hover:shadow-md hover:shadow-black/10 dark:edge dark:surface-80"
            >
              Learn More
            </a>
            <Button
              type="button"
              onClick={handleDismiss}
              className="flex-1 brand text-white border edge"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

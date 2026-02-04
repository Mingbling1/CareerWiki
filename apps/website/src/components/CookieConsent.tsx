'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const consent = localStorage.getItem('empliq-cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('empliq-cookie-consent', 'accepted')
    setIsVisible(false)
    console.log('Cookies aceptadas')
  }

  const handleDecline = () => {
    localStorage.setItem('empliq-cookie-consent', 'declined')
    setIsVisible(false)
    console.log('Cookies rechazadas')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-sm text-neutral-300">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio.{' '}
            <a 
              href="/privacidad" 
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Política de privacidad
            </a>
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-5 py-2.5 text-sm font-medium text-neutral-400 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

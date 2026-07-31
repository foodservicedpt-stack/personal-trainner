import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<Window & { prompt?: () => void; userChoice?: Promise<{ outcome: string }> } | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as unknown as Window & { prompt?: () => void })
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt?.prompt) return
    await deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result && result.outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">Instala la app en tu iPhone</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Toca el botón Compartir y elige <strong className="text-slate-300">Añadir a pantalla de inicio</strong> para acceder rápidamente.
            </p>
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="mt-3 rounded-xl bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400"
              >
                Instalar ahora
              </button>
            )}
          </div>
          <button onClick={() => setShow(false)} className="text-slate-500 hover:text-slate-300" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

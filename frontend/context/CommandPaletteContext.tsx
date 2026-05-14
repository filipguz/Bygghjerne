'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface CommandPaletteCtx {
  isOpen: boolean
  open:   () => void
  close:  () => void
}

const Ctx = createContext<CommandPaletteCtx>({ isOpen: false, open: () => {}, close: () => {} })

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Ctx.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCommandPalette = () => useContext(Ctx)

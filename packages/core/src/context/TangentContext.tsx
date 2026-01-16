import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { TangentContextValue, TangentRegistration, TangentValue } from '../types'
import { ControlPanel } from '../components/ControlPanel'
import { getStoredConfig, setStoredConfig, updateStoredConfig } from '../store'

const isDev = process.env.NODE_ENV === 'development'

export const TangentContext = createContext<TangentContextValue | null>(null)

interface TangentProviderProps {
  children: ReactNode
  endpoint?: string
}

const noopRegister = () => {}
const noopUnregister = () => {}
const noopUpdateValue = () => {}
const noopSetIsOpen = () => {}
const noopSetShowCode = () => {}

const prodContextValue: TangentContextValue = {
  registrations: new Map(),
  register: noopRegister,
  unregister: noopUnregister,
  updateValue: noopUpdateValue,
  isOpen: false,
  setIsOpen: noopSetIsOpen,
  showCode: false,
  setShowCode: noopSetShowCode,
  endpoint: '',
}

export function TangentProvider({ children, endpoint = '/__tangent/update' }: TangentProviderProps) {
  // Production: render children only, no overhead
  if (!isDev) {
    return <>{children}</>
  }

  return <TangentProviderDev endpoint={endpoint}>{children}</TangentProviderDev>
}

function TangentProviderDev({ children, endpoint }: TangentProviderProps) {
  const [registrations, setRegistrations] = useState<Map<string, TangentRegistration>>(new Map())
  const [isOpen, setIsOpen] = useState(true)
  const [showCode, setShowCode] = useState(false)

  const register = useCallback((registration: TangentRegistration) => {
    const storedConfig = getStoredConfig(registration.id)
    
    if (!storedConfig) {
      setStoredConfig(registration.id, registration.originalConfig)
    }

    setRegistrations(prev => {
      const next = new Map(prev)
      next.set(registration.id, {
        ...registration,
        currentConfig: storedConfig ?? { ...registration.originalConfig },
      })
      return next
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setRegistrations(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const updateValue = useCallback((id: string, key: string, value: TangentValue) => {
    updateStoredConfig(id, key, value)
    
    setRegistrations(prev => {
      const next = new Map(prev)
      const registration = next.get(id)
      if (registration) {
        const updated = {
          ...registration,
          currentConfig: { ...registration.currentConfig, [key]: value },
        }
        next.set(id, updated)
        registration.onUpdate(key, value)
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const contextValue: TangentContextValue = {
    registrations,
    register,
    unregister,
    updateValue,
    isOpen,
    setIsOpen,
    showCode,
    setShowCode,
    endpoint: endpoint!,
  }

  return (
    <TangentContext.Provider value={contextValue}>
      {children}
      {isOpen && registrations.size > 0 && <ControlPanel />}
    </TangentContext.Provider>
  )
}

export function useTangentContext(): TangentContextValue {
  const context = useContext(TangentContext)
  
  // Production: return noop context
  if (!isDev) {
    return prodContextValue
  }
  
  if (!context) {
    throw new Error('useTangentContext must be used within a TangentProvider')
  }
  return context
}

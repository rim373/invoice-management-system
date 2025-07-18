"use client"
import { createContext, useContext, useState, ReactNode } from "react"

type SoundSetting = "Default" | "Custom" | "Disabled"

interface SoundContextProps {
  soundSetting: SoundSetting
  setSoundSetting: (value: SoundSetting) => void
}

const SoundContext = createContext<SoundContextProps | undefined>(undefined)

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundSetting, setSoundSetting] = useState<SoundSetting>("Default")

  return (
    <SoundContext.Provider value={{ soundSetting, setSoundSetting }}>
      {children}
    </SoundContext.Provider>
  )
}

export const useSoundContext = () => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error("useSoundContext must be used within SoundProvider")
  }
  return context
}

import { useSoundContext } from "@/app/sound-context"

export const useClickSound = () => {
  const { soundSetting } = useSoundContext()

  const playClickSound = () => {
    if (soundSetting === "Disabled") return

    const audio = new Audio(
      soundSetting === "Custom"
        ? "/sounds/custom.mp3"
        : "/sounds/default.mp3"
    )

    audio.play().catch((error) => {
      console.warn("Sound playback failed:", error)
    })
  }

  return playClickSound
}

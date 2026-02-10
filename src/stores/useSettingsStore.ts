import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAudio } from '@/composables/useAudio'

const DEFAULT_FONT_SIZE = 16

export const useSettingsStore = defineStore('settings', () => {
  const fontSize = ref(DEFAULT_FONT_SIZE)

  const applyFontSize = () => {
    document.documentElement.style.fontSize = fontSize.value + 'px'
  }

  const changeFontSize = (delta: number) => {
    fontSize.value = Math.min(24, Math.max(12, fontSize.value + delta))
    applyFontSize()
  }

  const serialize = () => {
    const { sfxEnabled, bgmEnabled } = useAudio()
    return {
      fontSize: fontSize.value,
      sfxEnabled: sfxEnabled.value,
      bgmEnabled: bgmEnabled.value
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deserialize = (data: any) => {
    fontSize.value = data?.fontSize ?? DEFAULT_FONT_SIZE
    applyFontSize()
    const { sfxEnabled, bgmEnabled } = useAudio()
    sfxEnabled.value = data?.sfxEnabled ?? true
    bgmEnabled.value = data?.bgmEnabled ?? true
  }

  return { fontSize, changeFontSize, applyFontSize, serialize, deserialize }
})

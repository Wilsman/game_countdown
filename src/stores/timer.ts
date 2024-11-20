import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { differenceInSeconds, addSeconds, format } from 'date-fns'

export const useTimerStore = defineStore('timer', () => {
  const targetDate = ref(addSeconds(new Date(), 3600))
  const isEditMode = ref(true)
  const gameTitle = ref('Upcoming Game Release')
  const settings = ref({
    fontFamily: 'Inter',
    textColor: '#ffffff',
    backgroundColor: '#1a1a1a',
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    theme: 'dark'
  })

  const timeRemaining = computed(() => {
    const now = new Date()
    const diff = differenceInSeconds(targetDate.value, now)
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    const days = Math.floor(diff / (24 * 60 * 60))
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((diff % (60 * 60)) / 60)
    const seconds = diff % 60

    return { days, hours, minutes, seconds }
  })

  let intervalId: number | null = null

  function startTimer() {
    if (intervalId) return
    intervalId = window.setInterval(() => {
      // Force a recomputation of timeRemaining
      targetDate.value = new Date(targetDate.value)
    }, 1000)
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function setTargetDate(date: Date) {
    targetDate.value = date
  }

  function setGameTitle(title: string) {
    gameTitle.value = title
  }

  function toggleMode() {
    isEditMode.value = !isEditMode.value
  }

  function updateSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings }
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem('timerSettings', JSON.stringify({
      settings: settings.value,
      targetDate: targetDate.value.toISOString(),
      gameTitle: gameTitle.value
    }))
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('timerSettings')
    if (saved) {
      const data = JSON.parse(saved)
      settings.value = { ...settings.value, ...data.settings }
      targetDate.value = new Date(data.targetDate)
      if (data.gameTitle) {
        gameTitle.value = data.gameTitle
      }
    }
  }

  function getShareableUrl() {
    const params = new URLSearchParams({
      target: targetDate.value.toISOString(),
      theme: settings.value.theme,
      title: gameTitle.value
    })
    return `${window.location.origin}?${params.toString()}`
  }

  return {
    targetDate,
    isEditMode,
    settings,
    gameTitle,
    timeRemaining,
    setTargetDate,
    setGameTitle,
    toggleMode,
    updateSettings,
    saveToLocalStorage,
    loadFromLocalStorage,
    getShareableUrl,
    startTimer,
    stopTimer
  }
})
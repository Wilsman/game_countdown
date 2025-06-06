import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { differenceInSeconds } from "date-fns";
import confetti from "canvas-confetti";

export const useTimerStore = defineStore("timer", () => {
  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Set default target date to 9 PM in user's local timezone
  const defaultTargetDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow
    date.setHours(21, 0, 0, 0); // 9:00 PM
    return date;
  })();
  
  const targetDate = ref(defaultTargetDate);
  const targetTimezone = ref(userTimezone);
  const isEditMode = ref(false);
  const gameTitle = ref("ARC Raiders");
  const settings = ref({
    fontFamily: "Inter",
    textColor: "#ffffff",
    backgroundColor: "#1a1a1a",
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    enableSoundToggle: true,
    theme: "dark",
  });

  const hasReachedZero = ref(false);
  const audio =
    typeof window !== "undefined" ? new Audio("/timer-end.mp3") : null;
  let celebrationInterval: number | null = null;

  const timeRemaining = computed(() => {
    const now = new Date();
    const diff = differenceInSeconds(targetDate.value, now);

    // Check if timer just reached zero
    if (diff <= 0 && !hasReachedZero.value) {
      hasReachedZero.value = true;
      startCelebration();
    } else if (diff > 0 && hasReachedZero.value) {
      hasReachedZero.value = false;
      stopCelebration();
    }

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;

    return { days, hours, minutes, seconds };
  });

  let intervalId: number | null = null;

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function fireConfetti() {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const particleCount = 20;

    // Random bursts from different positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#ffd700", "#00ff00", "#0000ff", "#ff00ff"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#ffd700", "#00ff00", "#0000ff", "#ff00ff"],
    });

    // Occasional star burst from the center
    if (Math.random() < 0.3) {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.6 },
        startVelocity: 50,
        gravity: 0.7,
        shapes: ["star"],
        colors: ["#FFD700", "#FFA500", "#FF4500"],
      });
    }

    // Occasional streamers
    if (Math.random() < 0.2) {
      const streamers = {
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ffd700", "#ffb300"],
      };

      confetti({
        ...streamers,
        origin: { x: Math.random() < 0.5 ? 0 : 1 },
        angle: Math.random() < 0.5 ? 60 : 120,
      });
    }
  }

  function startCelebration() {
    // Play sound if enabled
    if (settings.value.enableSound && audio) {
      audio.play().catch(console.error);
    }

    // Initial intense burst
    for (let i = 0; i < 5; i++) {
      setTimeout(() => fireConfetti(), i * 200);
    }

    // Continue with regular intervals
    celebrationInterval = window.setInterval(fireConfetti, 300);
  }

  function stopCelebration() {
    if (celebrationInterval) {
      clearInterval(celebrationInterval);
      celebrationInterval = null;
    }
  }

  function startTimer() {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
      // Force a recomputation of timeRemaining
      targetDate.value = new Date(targetDate.value);
    }, 1000);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    stopCelebration();
  }

  const setTargetDate = (date: Date, timezone: string = userTimezone) => {
    targetDate.value = date;
    targetTimezone.value = timezone;
  };

  function setGameTitle(title: string) {
    gameTitle.value = title;
  }

  function toggleMode() {
    isEditMode.value = !isEditMode.value;
  }

  function updateSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings };
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem(
      "timerSettings",
      JSON.stringify({
        settings: settings.value,
        targetDate: targetDate.value.toISOString(),
        targetTimezone: targetTimezone.value,
        gameTitle: gameTitle.value,
      })
    );
  }

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('countdownTimer');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.targetDate) {
        targetDate.value = new Date(parsed.targetDate);
      }
      if (parsed.targetTimezone) {
        targetTimezone.value = parsed.targetTimezone;
      } else {
        // If no timezone was saved, use the current user's timezone
        targetTimezone.value = userTimezone;
      }
      if (parsed.gameTitle) {
        gameTitle.value = parsed.gameTitle;
      }
      if (parsed.settings) {
        settings.value = { ...settings.value, ...parsed.settings };
      }
    } else {
      // If no saved data, use the current user's timezone
      targetTimezone.value = userTimezone;
    }
  };

  function getShareableUrl() {
    const params = new URLSearchParams({
      target: targetDate.value.toISOString(),
      theme: settings.value.theme,
      title: gameTitle.value,
    });
    return `${window.location.origin}?${params.toString()}`;
  }

  return {
    targetDate,
    targetTimezone,
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
    stopTimer,
  };
});

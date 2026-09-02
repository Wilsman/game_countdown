import { onMounted, onUnmounted, ref, type Ref } from "vue";

export function useNow(): Ref<Date> {
  const now = ref<Date>(new Date());
  let intervalId: number | null = null;

  function tick(): void {
    now.value = new Date();
  }

  onMounted(() => {
    if (typeof window !== "undefined") {
      intervalId = window.setInterval(tick, 1000);
    }
  });

  onUnmounted(() => {
    if (intervalId !== null && typeof window !== "undefined") {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  });

  return now;
}

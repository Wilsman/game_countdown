<script setup lang="ts">
interface SparkleToggleProps {
  mode?: "to-pc" | "to-home";
}

withDefaults(defineProps<SparkleToggleProps>(), {
  mode: "to-pc",
});

const emit = defineEmits<{ (e: "click"): void }>();

function handleClick(): void {
  emit("click");
}
</script>

<template>
  <button
    type="button"
    class="sparkle-toggle inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="{
      'border-[#191919] bg-[#141414] text-[#f5f5f5] hover:border-[#346bf1] focus-visible:outline-[#346bf1]/50': true,
    }"
    :aria-label="mode === 'to-pc' ? 'Try the new PC countdowns page' : 'Back to the original countdown'"
    @click="handleClick"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="text-[#346bf1]"
      aria-hidden="true"
    >
      <path
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
      />
    </svg>
    <span class="hidden sm:inline">{{ mode === "to-pc" ? "New" : "Home" }}</span>
  </button>
</template>

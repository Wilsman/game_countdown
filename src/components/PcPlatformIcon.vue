<script setup lang="ts">
interface PlatformIconProps {
  name: string;
}

defineProps<PlatformIconProps>();

function titleForName(name: string): string {
  const titles: Record<string, string> = {
    windows: "PC / Windows",
    playstation: "PlayStation",
    xbox: "Xbox",
    "nintendo-switch": "Nintendo Switch",
    mobile: "Mobile",
  };
  return titles[name] || name;
}
</script>

<template>
  <span
    :title="titleForName(name)"
    class="inline-flex items-center justify-center"
  >
    <svg
      v-if="name === 'windows'"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-full w-full"
    >
      <path d="M0 4.5h10v6H0v-6zm13-1.5L24 1v9H13V3zM13 13h11v9l-11-1.5V13zM0 13.5h10v6H0v-6z" />
    </svg>

    <svg
      v-else-if="name === 'playstation'"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-full w-full"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-7l5.5 3.5L11 16.5z" />
    </svg>

    <svg
      v-else-if="name === 'xbox'"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-full w-full"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.12 13.88L12 13.41l-3.12 2.47 1.12-3.88-3.06-2.29h3.78L12 6.59l1.18 3.12h3.78l-3.06 2.29 1.22 3.88z" />
    </svg>

    <svg
      v-else-if="name === 'nintendo-switch'"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-full w-full"
    >
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <circle cx="8" cy="12" r="1.5" fill="#0a0a0a" />
      <circle cx="16" cy="12" r="1.5" fill="#0a0a0a" />
    </svg>

    <svg
      v-else-if="name === 'mobile'"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-full w-full"
    >
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <circle cx="12" cy="17" r="1.5" fill="#0a0a0a" />
    </svg>

    <span v-else class="text-[10px] uppercase">{{ name[0] }}</span>
  </span>
</template>

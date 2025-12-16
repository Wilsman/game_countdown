<!-- components/ControlPanel.vue (modernized settings panel) -->
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { toast } from "vue-sonner";
import { useTimerStore } from "../stores/timer";
import { storeToRefs } from "pinia";

const store = useTimerStore();
const { settings, gameTitleColor } = storeToRefs(store);

const isOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);

const copyShareableUrl = async () => {
  try {
    const url = store.getShareableUrl();
    if (!url) return;

    if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("URL copied to clipboard!");
    }
  } catch (error) {
    console.error("Failed to copy URL:", error);
    toast.error("Failed to copy URL");
  }
};

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function closePanel() {
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    closePanel();
  }
}

watch(isOpen, (newValue) => {
  if (newValue) document.addEventListener("mousedown", handleClickOutside);
  else document.removeEventListener("mousedown", handleClickOutside);
});

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const fontFamilies = [
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "System UI" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "monospace", label: "Monospace" },
];

const fontSizes = [
  { value: 32, label: "Small" },
  { value: 48, label: "Medium" },
  { value: 64, label: "Large" },
  { value: 80, label: "Extra Large" },
];

const hasGameBackground = computed(() => {
  const gameId = store.activeGame?.id?.toLowerCase() ?? "";
  return (
    gameId.includes("bf6") ||
    gameId.includes("battlefield") ||
    gameId.includes("tarkov") ||
    gameId.includes("0.16.8.0") ||
    gameId.includes("arc") ||
    gameId.includes("raiders")
  );
});

function updateSetting(key: string, value: any) {
  store.updateSettings({ [key]: value });
}

function updateTitleColor(color: string) {
  store.setGameTitleColor(color);
}

function resetToDefaults() {
  store.updateSettings({
    fontFamily: "Inter",
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    theme: "dark",
    enableGameBackground: true,
  });
  store.setGameTitleColor("#06B6D4");
}

function exportSettings() {
  const settingsData = {
    settings: settings.value,
    titleColor: gameTitleColor.value,
    gameTitle: store.gameTitle,
    targetDate: store.targetDate,
    targetTimezone: store.targetTimezone,
  };

  const dataStr = JSON.stringify(settingsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "timer-settings.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importSettings(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (data.settings) store.updateSettings(data.settings);
      if (data.titleColor) store.setGameTitleColor(data.titleColor);
      if (data.gameTitle) store.setGameTitle(data.gameTitle);
      if (data.targetDate && data.targetTimezone) {
        store.setTargetDate(new Date(data.targetDate), data.targetTimezone);
      }
      toast.success("Settings imported!");
    } catch (error) {
      console.error("Failed to import settings:", error);
      toast.error("Failed to import settings. Check the file format.");
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = "";
}
</script>

<template>
  <div class="control-panel" ref="panelRef">
    <!-- Settings Button (Icon) -->
    <button
      @click="togglePanel"
      class="settings-button soft-btn"
      :class="{ 'is-active': isOpen }"
      title="Open Settings"
      aria-label="Open Settings"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>

    <!-- Modal Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click="closePanel"
      >
        <!-- Modal Panel -->
        <div
          class="glass-panel w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4"
          >
            <h3
              class="flex items-center gap-3 text-lg font-bold text-slate-100"
            >
              <span
                class="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              ></span>
              Configuration
            </h3>
            <button
              @click="closePanel"
              class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div
            class="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            <!-- Appearance Section -->
            <section class="space-y-4">
              <h4
                class="text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Appearance
              </h4>

              <div class="grid gap-4 sm:grid-cols-2">
                <!-- Theme Select -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-300"
                    >Theme</label
                  >
                  <div class="relative">
                    <select
                      :value="settings.theme"
                      @change="
                        updateSetting(
                          'theme',
                          ($event.target as HTMLSelectElement).value
                        )
                      "
                      class="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    >
                      <option
                        v-for="theme in themes"
                        :key="theme.value"
                        :value="theme.value"
                      >
                        {{ theme.label }}
                      </option>
                    </select>
                    <div
                      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Font Family -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-300"
                    >Font Family</label
                  >
                  <div class="relative">
                    <select
                      :value="settings.fontFamily"
                      @change="
                        updateSetting(
                          'fontFamily',
                          ($event.target as HTMLSelectElement).value
                        )
                      "
                      class="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    >
                      <option
                        v-for="font in fontFamilies"
                        :key="font.value"
                        :value="font.value"
                      >
                        {{ font.label }}
                      </option>
                    </select>
                    <div
                      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Font Size -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-300"
                    >Display Size</label
                  >
                  <div class="relative">
                    <select
                      :value="settings.fontSize"
                      @change="
                        updateSetting(
                          'fontSize',
                          parseInt(($event.target as HTMLSelectElement).value)
                        )
                      "
                      class="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    >
                      <option
                        v-for="size in fontSizes"
                        :key="size.value"
                        :value="size.value"
                      >
                        {{ size.label }}
                      </option>
                    </select>
                    <div
                      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Accent Color -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-300"
                    >Accent Color</label
                  >
                  <div
                    class="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5"
                  >
                    <input
                      type="color"
                      :value="gameTitleColor"
                      @input="
                        updateTitleColor(
                          ($event.target as HTMLInputElement).value
                        )
                      "
                      class="h-6 w-8 cursor-pointer bg-transparent"
                    />
                    <span class="text-xs font-mono text-slate-400">{{
                      gameTitleColor
                    }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Toggles Section -->
            <section class="space-y-4">
              <h4
                class="text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Experience
              </h4>

              <div class="grid gap-3 sm:grid-cols-2">
                <!-- Game Background Toggle -->
                <label
                  v-if="hasGameBackground"
                  class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10"
                >
                  <span class="text-sm font-medium text-slate-300"
                    >Game Background</span
                  >
                  <div
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                    :class="
                      settings.enableGameBackground
                        ? 'bg-cyan-500'
                        : 'bg-slate-700'
                    "
                  >
                    <span
                      class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                      :class="
                        settings.enableGameBackground
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      "
                    ></span>
                    <input
                      type="checkbox"
                      class="sr-only"
                      :checked="settings.enableGameBackground"
                      @change="
                        updateSetting(
                          'enableGameBackground',
                          ($event.target as HTMLInputElement).checked
                        )
                      "
                    />
                  </div>
                </label>
                <!-- Animation Toggle -->
                <label
                  class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10"
                >
                  <span class="text-sm font-medium text-slate-300"
                    >Animations</span
                  >
                  <div
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                    :class="
                      settings.enableAnimation ? 'bg-cyan-500' : 'bg-slate-700'
                    "
                  >
                    <span
                      class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                      :class="
                        settings.enableAnimation
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      "
                    ></span>
                    <input
                      type="checkbox"
                      class="sr-only"
                      :checked="settings.enableAnimation"
                      @change="
                        updateSetting(
                          'enableAnimation',
                          ($event.target as HTMLInputElement).checked
                        )
                      "
                    />
                  </div>
                </label>
                 <!-- Sound Toggle -->
                 <label
                   class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10"
                 >
                   <span class="text-sm font-medium text-slate-300"
                     >Sound Effects</span
                   >
                   <div
                     class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                     :class="
                       settings.enableSound ? 'bg-cyan-500' : 'bg-slate-700'
                     "
                   >
                     <span
                       class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                       :class="
                         settings.enableSound ? 'translate-x-5' : 'translate-x-1'
                       "
                     ></span>
                     <input
                       type="checkbox"
                       class="sr-only"
                       :checked="settings.enableSound"
                       @change="
                         updateSetting(
                           'enableSound',
                           ($event.target as HTMLInputElement).checked
                         )
                       "
                     />
                   </div>
                 </label>
                 <!-- Christmas Theme Toggle -->
                 <label
                   class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10"
                 >
                   <span class="text-sm font-medium text-slate-300"
                     >🎄 Christmas Theme</span
                   >
                   <div
                     class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                     :class="
                       settings.enableChristmasTheme ? 'bg-red-500' : 'bg-slate-700'
                     "
                   >
                     <span
                       class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                       :class="
                         settings.enableChristmasTheme ? 'translate-x-5' : 'translate-x-1'
                       "
                     ></span>
                     <input
                       type="checkbox"
                       class="sr-only"
                       :checked="settings.enableChristmasTheme"
                       @change="
                         updateSetting(
                           'enableChristmasTheme',
                           ($event.target as HTMLInputElement).checked
                         )
                       "
                     />
                   </div>
                 </label>
              </div>
            </section>

            <!-- Share Section -->
            <section class="space-y-4">
              <h4
                class="text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Share
              </h4>
              <button
                @click="copyShareableUrl"
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-cyan-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Copy Link
              </button>
            </section>

            <!-- Data Actions -->
            <section class="space-y-4">
              <h4
                class="text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Data & Reset
              </h4>

              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="exportSettings"
                  class="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-cyan-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Config
                </button>
                <label
                  class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-cyan-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Import Config
                  <input
                    type="file"
                    accept=".json"
                    @change="importSettings"
                    class="hidden"
                  />
                </label>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-2">
                <button
                  @click="store.resetGames"
                  class="flex items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path
                      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                    />
                  </svg>
                  Reset Games
                </button>
                <button
                  @click="resetToDefaults"
                  class="flex items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18l-1.5 14H4.5L3 6z" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Reset All
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.6); /* Slate-900 with opacity */
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05); /* inner stroke */
}

/* Custom scrollbar for the modal content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.soft-btn {
  /* Inherit shared button styles or define simplified version here if global css isn't enough */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: theme("colors.slate.400");
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 0.75rem;
}
.soft-btn:hover {
  color: theme("colors.white");
  background: rgba(255, 255, 255, 0.05);
}
.soft-btn.is-active {
  color: theme("colors.cyan.400");
  background: rgba(6, 182, 212, 0.1);
}

/* Toggles */
.toggle {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.toggle:last-child {
  margin-bottom: 0;
}

.toggle input {
  appearance: none;
  width: 44px;
  height: 24px;
  background: linear-gradient(180deg, #242424, #1a1a1a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 999px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.toggle input::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff, #eaeaea);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease;
}
.toggle input:checked {
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.35),
    rgba(6, 182, 212, 0.25)
  );
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 6px 18px rgba(6, 182, 212, 0.18) inset;
}
.toggle input:checked::before {
  transform: translateX(20px);
}
.toggle .slider {
  display: none;
} /* kept for structure compat */
.toggle-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
}

/* Actions */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 10px 12px;
  text-align: center;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  cursor: pointer;
  transition: transform 0.15s ease, background 0.3s ease, border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.action-button:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.45);
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.16),
    rgba(6, 182, 212, 0.12)
  );
  box-shadow: 0 10px 26px rgba(6, 182, 212, 0.22);
}
.action-button svg {
  flex: 0 0 auto;
}

.subtle {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.01),
    rgba(255, 255, 255, 0.005)
  );
}

.danger-strong {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.12)
  );
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
  font-weight: 800;
  box-shadow: 0 8px 26px rgba(239, 68, 68, 0.18);
}
.danger-strong:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.28),
    rgba(239, 68, 68, 0.18)
  );
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 12px 30px rgba(239, 68, 68, 0.25);
}

/* File input */
.file-input-label {
  position: relative;
  overflow: hidden;
}
.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Scrollbar (scoped) */
.panel-content::-webkit-scrollbar {
  width: 10px;
}
.panel-content::-webkit-scrollbar-track {
  background: #101010;
}
.panel-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #1e1e1e, #2a2a2a);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Responsive */
@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>

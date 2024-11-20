<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()
</script>

<template>
  <div class="hamburger-icon" :class="{ 'open': isOpen }">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
.hamburger-icon {
  width: 28px;
  height: 28px;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px;
}

.hamburger-icon span {
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-origin: 1px center;
  border-radius: 2px;
}

.hamburger-icon.open span:first-child {
  transform: rotate(45deg) translate(1px, -1px);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  transform: translateX(-20px);
}

.hamburger-icon.open span:last-child {
  transform: rotate(-45deg) translate(1px, 1px);
}
</style>

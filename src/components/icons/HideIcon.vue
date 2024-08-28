<script setup lang="ts">
interface Props {
  parentClass: string;
}

defineProps<Props>();
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="parentClass">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
  </svg>
</template>
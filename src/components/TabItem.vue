<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  activeClass: boolean;
}

const props = defineProps<Props>();

const tabClass = computed(() => {
  const baseClasses = 'px-2 py-2 flex flex-1 shrink-0 truncate items-center cursor-pointer lg:w-60 md:w-24 w-16 border-r-2';

  if (props.activeClass) {
    return `${baseClasses} bg-secondary text-active rounded-t-lg rounded-b-none border-r-0`;
  } else {
    return `${baseClasses} text-tertiary`;
  }
})

</script>

<template>
  <li :class="tabClass">
    <slot name="icon" />

    <span
      class="overflow-hidden md:max-w-56 max-w-20 text-ellipsis whitespace-nowrap text-sm"
    >
      <slot name="text" />
    </span>

    <slot name="button" />
  </li>
</template>
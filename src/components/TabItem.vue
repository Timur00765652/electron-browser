<script setup lang="ts">
interface Props {
  activeClass: boolean;
}

defineProps<Props>();

</script>

<template>
  <li
    :class="[
      'px-2 py-2 flex flex-1 shrink-0 truncate items-center cursor-pointer lg:w-60 md:w-24 w-16 border-r-2',
      {
        'bg-secondary text-active rounded-t-lg rounded-b-none border-r-0': activeClass,
        'text-tertiary': !activeClass
      },
      {
        'bg-secondary text-active rounded-t-lg rounded-b-none border-r-0': activeClass,
        'text-tertiary': !activeClass
      }
    ]"
  >
    <slot name="icon" />

    <span
      class="overflow-hidden md:max-w-56 max-w-20 text-ellipsis whitespace-nowrap text-sm"
    >
      <slot name="text" />
    </span>

    <slot name="button" />
  </li>
</template>
<script setup lang="ts">
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon.vue";
import ReloadIcon from "@/components/icons/ReloadIcon.vue";
interface EmitOptions {
  (event: 'update:modelValue', value: string): void;
  (event: 'enter'): void;
  (event: 'reloadTab'): void;
  (event: 'previousTab'): void;
  (event: 'nextTab'): void;
}

const emit = defineEmits<EmitOptions>();
const modelValue = defineModel<string>();

const onEnter = () => {
  emit('enter');
};

const onReload = () => {
  emit('reloadTab');
};

const onPrevious = () => {
  emit('previousTab');
};

const onNext = () => {
  emit('nextTab');
};
</script>

<template>
  <div class="flex items-center w-full gap-2">
    <div class="flex items-center gap-2">
      <ArrowLeftIcon parent-class="size-5 cursor-pointer hover:text-active" @click="onPrevious"/>
      <ArrowRightIcon parent-class="size-5 cursor-pointer hover:text-active" @click="onNext"/>
    </div>

    <ReloadIcon parent-class="ml-2 size-5 cursor-pointer hover:text-active" @click="onReload"/>

    <input
      v-model="modelValue"
      class="w-full"
      placeholder="Enter URL"
      @keyup.enter="onEnter"
    >
  </div>
</template>
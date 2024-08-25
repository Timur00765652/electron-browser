<script setup lang="ts">
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon.vue";
import ReloadIcon from "@/components/icons/ReloadIcon.vue";

interface Props {
  modelValue: string;
}
interface EmitOptions {
  (event: 'update:modelValue', value: string): void;
  (event: 'enter'): void;
  (event: 'reloadTab'): void;
  (event: 'previousTab'): void;
  (event: 'nextTab'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitOptions>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function onEnter() {
  emit('enter');
}

function onReload() {
  emit('reloadTab');
}

function onPrevious() {
  emit('previousTab');
}

function onNext() {
  emit('nextTab');
}
</script>

<template>
  <div class="flex items-center w-full gap-2">
    <div class="flex items-center gap-2">
      <ArrowLeftIcon parent-class="size-5 cursor-pointer hover:text-active" @click="onPrevious"/>
      <ArrowRightIcon parent-class="size-5 cursor-pointer hover:text-active" @click="onNext"/>
    </div>

    <ReloadIcon parent-class="ml-2 size-5 cursor-pointer hover:text-active" @click="onReload"/>

    <input
      class="w-full"
      :value="modelValue"
      @input="onInput"
      placeholder="Enter URL"
      @keyup.enter="onEnter"
    />
  </div>
</template>
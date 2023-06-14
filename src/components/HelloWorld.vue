<script setup>
  import { useDropZone } from '@vueuse/core'

  const dropZoneRef = ref()

  function onDrop(files) {
    // called when files are dropped on zone
  }

  const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
</script>

<template>
  <div ref="dropZoneRef">
    Drop files here
  </div>
</template>

<style scoped>
</style>

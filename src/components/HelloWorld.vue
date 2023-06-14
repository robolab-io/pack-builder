<script setup>
  import { useDropZone } from '@vueuse/core'
  import {handleUpload} from 'pack-builder'

  const dropZoneRef = ref()

  function onDrop(files) {
    handleUpload(files)
    /*
      type: "application/json" //json
      type: "" // .mecha
      type: "" // folder
      type: "application/x-zip-compressed" // robolab soundpack raw zip
      type: "audio/mpeg"  // mp3
    */
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


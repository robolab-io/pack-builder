<script setup>
  import { useDropZone } from '@vueuse/core'
  import { useFileDialog } from '@vueuse/core'

  import {handleUpload} from 'pack-builder'
  
  const { onChange, open } = useFileDialog()
  onChange(handleUpload)

  const dropZoneRef = ref()

  async function onDrop(files) {
    await handleUpload(files)
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
    <!-- <input 
      type="file" id="file" name="file" multiple 
      @change="handleUpload" 
    /> -->
    <button type="button" @click="open">Choose file</button>
    <input 
      type="url" 
      placeholder="https://example.com/thing.(zip|mp3|wav)"
      pattern="https://.*"
    >
  </div>
</template>

<style scoped>
</style>


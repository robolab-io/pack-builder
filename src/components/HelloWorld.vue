<script setup>
  import { useDropZone } from '@vueuse/core'
  import { useFileDialog } from '@vueuse/core'

  import {handleUpload, EE} from 'pack-builder'
  
  const { onChange, open } = useFileDialog()
  onChange(handleUpload)

  const dropZoneRef = ref()

  async function onDrop(files) {
    await handleUpload(files)
    /*
      type: "application/json" //json
      type: "" // .mecha
      type: "" // folder (if all audio and no config, import audio. if config, zip[to reuse code] and parse)
      type: "application/x-zip-compressed" // robolab soundpack raw zip
      type: "audio/mpeg"  // mp3
    */
  }

  const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

  const uiProgress = ref('0%')
  EE.on('ffmpeg-update', async (progressArr) => {
    let [progress, total] = progressArr
    if (progress%20 && progress!==total) return
    uiProgress.value =  `${100 * progress/total | 0}%`

    console.log( uiProgress.value )  // prints expected value just fine
  })
</script>

<template>
  <div>
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
    <div :key="uiProgress">
      {{ uiProgress }}
    </div>
  </div>
</template>

<style scoped>
</style>


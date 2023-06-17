<script setup>
  import { useDropZone } from '@vueuse/core'
  import { useFileDialog } from '@vueuse/core'

  //import {handleUpload} from 'pack-builder'
  
  const { onChange, open } = useFileDialog()
  //onChange(handleUpload)

  const dropZoneRef = ref()

  let packState = ref({})
  let progress = ref(0)

  async function onDrop(files) {
    const worker = new Worker("pack-builder/worker", { type: "module" });

    worker.postMessage(files)
    worker.onmessage = e => {
      let [channel, data] = e.data
      if (channel==='result') {
        packState.value = data
      }
      if (channel==='progress') {
        progress.value = data
      }
    }

    //await handleUpload(files)
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
    {{ packState }}
    {{ progress }}
  </div>
</template>

<style scoped>
</style>


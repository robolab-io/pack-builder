<script setup>
  import { useDropZone } from '@vueuse/core'
  import { useFileDialog } from '@vueuse/core'

  function handleUpload(files) {
    const worker = new Worker("pack-builder/worker", { type: "module" });

    worker.postMessage(files)
    worker.onmessage = e => {
      let [channel, data] = e.data
      if (channel==='progress') {
        let [pro, total] = data
        progress.value = 100 * pro / total | 0
      } else 
      if (channel==='result-pack') {
        // prompt user if they are okay with overwriting their current session
        packState.value = data
      } else 
      if (channel==='result-sound') {
        packState.value.soundNames = {
          ...(packState.value.soundNames ?? {}),
          ...data
        }
      }
      if (/^result/.test(channel)) {
        console.log(e.data)
        worker.terminate()
      }
    }
  }
  
  const { onChange, open } = useFileDialog()
  onChange(handleUpload)

  const dropZoneRef = ref()

  let packState = ref({})
  let progress = ref(0)

  async function onDrop(files) {
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
    Drop files here [ Only accepts a Zipped pack or Audio file(s) ]
    <button type="button" @click="open">Choose file</button>
    <input 
      type="url" 
      placeholder="https://example.com/thing.(zip|mp3|wav)"
      pattern="https://.*"
    >
    <div v-if="progress">
      <p>Progress: {{ progress }}%</p>
      <progress :value="progress" max="100"/>
    </div>

    <br/>

    <div>
      {{ packState }}
    </div>
  </div>
</template>

<style scoped>
</style>


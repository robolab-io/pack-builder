<script setup>
  import { useDropZone, useFileDialog } from '@vueuse/core'

  // NOTE: might be worth moving to this sort of system. I could handle folders then too
  // import { useFileSystemAccess  } from '@vueuse/core'
  // const { data, save, saveAs, updateData } = useFileSystemAccess()

  let elWithAttrs = (tag, attrs, parent=document)=> {
    const el = parent.createElement(tag)
    Object.entries(attrs).forEach(([k,v])=>el[k]=v)
    return el
  }

  let msgHandler = worker => e => {
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
    } else 
    if (channel==='result-download') {
      let {link, name} = data
      const a = elWithAttrs('a', {download: name, href: link})
      a.addEventListener("click", ()=>{
        a.remove()
        setTimeout(URL.revokeObjectURL, 500, link)
      })
      a.click()
    }

    if (/^result/.test(channel)) {
      console.log(e.data)
      worker.terminate()
    }
  }

  function handleUpload(files) {
    const worker = new Worker("pack-builder/worker", { type: "module" });

    worker.postMessage(['upload', files])
    worker.onmessage = msgHandler(worker)
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

  function download(target) {
    const worker = new Worker("pack-builder/worker", { type: "module" });
    worker.postMessage(['download', target, toRaw(packState.value)])
    worker.onmessage = msgHandler(worker)
  }

</script>

<template>
  <div ref="dropZoneRef">
    Drop files here [ Only accepts a Zipped pack or Audio file(s) ]
    <button @click="open">Choose file</button>
    <!-- <input 
      type="url" 
      placeholder="https://example.com/thing.(zip|mp3|wav)"
      pattern="https://.*"
    > -->
    <div v-if="progress">
      <p>Progress: {{ progress }}%</p>
      <progress :value="progress" max="100"/>
    </div>

    <button @click="download('MKL')">  Download MKL </button>
    <button @click="download('MM')" >  Download MM  </button>
    <button @click="download('MV')" >  Download MV  </button>
    <button @click="download('V2')" >  Download V2  </button>

    <br/>

    <div>
      {{ packState }}
    </div>
  </div>
</template>

<style scoped>
</style>


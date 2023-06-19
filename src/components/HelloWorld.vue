<script setup>
  import { useDropZone } from '@vueuse/core'
  import { useFileDialog } from '@vueuse/core'

  import JSZip from 'jszip'

  function handleUpload(files) {

    // Audio File Uploads
    let isAudioUpload = files.every(f=>/^audio\//.test(f.type))
    if (isAudioUpload) return console.log('audio', isAudioUpload)

    // Folder Uploads (assume pack)
    if(files[0].type === '') { // assume directory
      var zip = new JSZip();
      var folder = zip.folder(files[0])
      console.log(folder)

      for (var i = 0; i < files[0].files.length; i++) {
        var file = files[0].files[i];
        folder.file(file.webkitRelativePath, file);
      }

      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // Save the zip file or do something with the content
        saveAs(content, 'uploaded-folder.zip');
      });

    }
    
    

    const worker = new Worker("pack-builder/worker", { type: "module" });

    worker.postMessage(files)
    worker.onmessage = e => {
      let [channel, data] = e.data
      if (channel==='result') {
        packState.value = data
        worker.terminate()
      }
      if (channel==='progress') {
        let [pro, total] = data
        progress.value = 100 * pro / total | 0
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

  async function zipFolder(e) {
    let folderInput = e.target.files
    if (folderInput.length === 0) return console.log('No files selected.');

    let zip = new JSZip();

    async function traverseFileTree(item, path = '') {
      if (item.isFile) {
        const fileHandle = await item.getFile();
        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        zip.file(path + file.name, arrayBuffer);
      } else if (item.isDirectory) {
        const directoryHandle = await item.getDirectory();
        const entries = await directoryHandle.getEntries();
        const folder = zip.folder(path + item.name + '/');
        for (const entry of entries) {
          await traverseFileTree(entry, path + item.name + '/');
        }
      }
    }

    for (const item of folderInput) {
      //zip.file(item.webkitRelativePath, await item.arrayBuffer())
      //const fileHandle = await item.getAsFileSystemHandle();
      //await traverseFileTree(fileHandle);
      console.log(folderInput[0].webkitGetAsEntry())
      console.log(item.isFile, item.isDirectory)
    }

    let out = await zip.generateAsync({ type: 'blob' })
    handleUpload([out])
  }

</script>

<template>
  <div ref="dropZoneRef">
    Drop files here
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

    <input 
      type="file" 
      webkitdirectory directory
      @change="zipFolder"
    >
  </div>
</template>

<style scoped>
</style>


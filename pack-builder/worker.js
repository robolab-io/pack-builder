//console.log('WebWorker Activated')
import { handleUpload } from './index'
import { EE } from './Utils'

EE.on('ffmpeg-update', v =>{
  postMessage(['progress', v])
})

onmessage = async (e) => {
  let files = e.data
  let [resultType, value] = await handleUpload(files)
  postMessage([`result-${resultType}`, value]);
};
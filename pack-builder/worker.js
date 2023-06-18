console.log('WebWorker Activated')
import { handleUpload } from './index'
import { EE } from './Utils'

EE.on('ffmpeg-update', v =>{
  postMessage(['progress', v])
})

onmessage = async (e) => {
  console.log('hit2', e.data)
  let files = e.data
  let result = await handleUpload(files)
  postMessage(['result', result]);
};
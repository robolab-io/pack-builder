import { handleUpload, EE } from './index'

EE.on('ffmpeg-update', v =>{
  postMessage(['progress', v])
})

onmessage = async (e) => {
  let files = e.data
  let result = await handleUpload(files)
  postMessage(['result', result]);
};
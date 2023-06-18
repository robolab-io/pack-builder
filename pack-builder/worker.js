import { handleUpload, EE, test } from './index'

EE.on('ffmpeg-update', v =>{
  postMessage(['progress', v])
})

/* test((v)=>{
  console.log('RUUUU', v)
  postMessage(['progress', v])
}) */

onmessage = async (e) => {
  let files = e.data
  let result = await handleUpload(files)
  postMessage(['result', result]);
};
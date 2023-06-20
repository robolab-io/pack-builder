//console.log('WebWorker Activated')
import { handleUpload } from './index'
import { EE } from './Utils'

import {download} from './download'

EE.on('ffmpeg-update', v =>{
  postMessage(['progress', v])
})

onmessage = async ({data:[channel, ...data]}) => {
  if (channel==='upload') {
    let [ files ] = data
    let [resultType, value] = await handleUpload(files)
    postMessage([`result-${resultType}`, value]);
  } else
  if (channel==='download') {
    let [target, packState] = data
    let [zipBlob, name] = await download(target, packState)
    const zipLink = URL.createObjectURL(zipBlob);
    postMessage(['result-download', {link: zipLink, name}]);
  }
};
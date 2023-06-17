console.log('hit')

import { handleUpload } from './index'

onmessage = async (e) => {
  let files = e.data
  let result = await handleUpload(files)

  console.log(result)
  postMessage(['result', result]);
};
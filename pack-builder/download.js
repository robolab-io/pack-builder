import JSZip from 'jszip'
import { downloadMKL } from './targets/MKL'

export async function download(target, packState) {
  let zip = new JSZip()

  let { assignment, soundNames, name } = packState

  if(target === 'MKL') {
    downloadMKL(zip, assignment, soundNames, name)
  } else 
  if(target === 'MM') {

  } else 
  if(target === 'MV') {
    
  } if(target === 'V2') {
    
  } else {
    console.warn('failed to resolve download target')
  }

  let res = await zip.generateAsync({type: 'blob'})
  return [res, `${name}.zip`]
}

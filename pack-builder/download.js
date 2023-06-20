import JSZip from 'jszip'

export async function download(target, packState) {
  let zip = new JSZip()
  
  MKL : {
    let [k,v] = Object.entries(packState.soundNames)[0]
    let blob = v.blob
    zip.file('test.wav', blob, {
      createFolders: true
    })
  }
  MM : { }
  MV : { }
  V2 : { }

  let res = await zip.generateAsync({type: 'blob'})
  return [res, 'testing.zip']
}

/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import JSZip from 'jszip'

let isMechaKeysV2Zip = () => { // && KeyTao
  
}

let isMechaKeysLegacyZip = () => {
  // has the form of 
  // /enter /space /alpha /alt (/style?)
  // /left /middle /right
}

let isMechVibesZip = () => {  // && rustyvibes

}

let isMechVibesPPZip = () => {

}

let loadZip = async (file) => {
  let zip = await JSZip
    .loadAsync(file)
    .then( zip => {
      console.log('loaded zip')
      return zip
    })
    .catch( err => {
      console.error(err.message)
      return null
    });
  return zip
}

const getConfigYAML = (zip) => {
  return zip.file(/[^\/]*\/config.(yaml|yml)/)?.[0] ?? false
}

const getConfigJSON = (zip) => {
  return zip.file(/[^\/]*\/config.json/)?.[0] ?? false
}

export async function handleUpload(files) {
  if (files == null) return console.warn('Invalid file drop') // text snippet or something

  // for now ignore multi upload
  file: {
    let file = files[0]

    // zip
    if (file.type === "application/x-zip-compressed") {
      let zip = await loadZip(file)
      if (!zip) return console.warn('Failed to parse zip')
    
      let isConfigYAML = getConfigYAML(zip)
      let isConfigJSON = getConfigJSON(zip)
    
      if (isConfigYAML) {
        return console.log('isModelmZip')
      }
    
      if (isConfigJSON) {
        return console.log('isMechaKeysV2Zip || isMechVibesZip || isMechVibesPPZip')
      }
    
      return console.log('isMechaKeysV2Zip || isMechaKeysLegacyZip')
    }

    // pack

    // audio
  }
}
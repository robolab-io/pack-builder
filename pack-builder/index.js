/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import JSZip from 'jszip'

let loadZip = async (file) => {
  let zip = await JSZip
    .loadAsync(file)
    .then( zip => {
      //console.log('loaded zip')
      return zip
    })
    .catch( err => {
      console.error(err.message)
      return null
    });
  return zip
}

let checkMechaKeysLegacy, isMechVibesConfig, isMechVibesPPConfig, getConfigYAML, getConfigJSON;
Pack_Detection : {
  checkMechaKeysLegacy = (zip) => {
    let isKeyPack = ['enter', 'space', 'alpha', 'alt'].every(dir => {
      let pattern = new RegExp(`[^\/]*\/${dir}\/$`)
      return zip.folder(pattern)?.[0] ?? false
    })

    let isMousePack = ['left', 'middle', 'right'].every(dir => {
      let pattern = new RegExp(`[^\/]*\/${dir}\/$`)
      return zip.folder(pattern)?.[0] ?? false
    })

    return {isKeyPack, isMousePack}
  }

  isMechVibesConfig = (data) => {  // && rustyvibes
    return ["id", "name", "key_define_type", /* "includes_numpad", */ "sound", "defines"].every(k => k in data)
  }

  isMechVibesPPConfig = (data) => {
    return Object.keys(data.defines).some(k => /^0+/.test(k))
  }

  getConfigYAML = (zip) => {
    return zip.file(/[^\/]*\/config.(yaml|yml)/)?.[0] ?? false
  }

  getConfigJSON = (zip) => {
    return zip.file(/[^\/]*\/config.json/)?.[0] ?? false
  }
}

Parse_Packs: {
  
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
      let isMechaKeysLegacy = checkMechaKeysLegacy(zip)
    
      // Modelm
      if (isConfigYAML) {
        return console.log('Modelm')
      }
    
      // Mechvibes || MechvibesPP || MechaKeysV2
      if (isConfigJSON) {
        let data = JSON.parse(
          await isConfigJSON.async('text') || '{}'
        )

        // Mechvibes check
        if (isMechVibesConfig(data)) {
          // no good way to differentiate mouse vs key packs
          if (isMechVibesPPConfig(data)) return console.log('Mechvibes PP')
          return console.log('Mechvibes', data["key_define_type"])
        }
        
        // V2 check (will prob just have a schema key)
        return console.log('MechaKeys V2', data?.schema)
      }
    
      // MechaKeys
      if (Object.values(isMechaKeysLegacy).some(k=>k)) {
        return console.log('MechaKeys Legacy', isMechaKeysLegacy)
      }
    
      return console.warn('failed to identify zip pack')
    }

    // pack

    // audio
  }
}
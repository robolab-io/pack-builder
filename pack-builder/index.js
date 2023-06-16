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
    return ["id", "name", "key_define_type", /* "includes_numpad", "sound",*/ "defines"].every(k => k in data)
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

let spHash, parseVibes;
Parse_Packs: {
  spHash = (ogName, spData) => {
    return ogName + '_fakehash' //hash spData
  }

  parseVibes = async (zip, config, pack) => {
    let {id, name, key_define_type, includes_numpad, sound, defines, isPP} = config

    if(key_define_type === 'single') {
      console.log('wasm ffmpeg pack fixer required.\nUse on the given sound file:', sound)
    } else {
      pack.name = name

      for (let [keyCode, path] of Object.entries(defines)) {
        let pattern = new RegExp(`.*/${path}$`)
        let audioBlob = await zip.file(pattern)?.[0]?.async("blob")

        console.log('hit', audioBlob)
        //let hashName = spHash(path, audioBlob)

        if (!audioBlob) continue

        let audio = document.createElement("audio");
        audio.src = URL.createObjectURL(audioBlob);
        audio.play();

      }
    }

    pack.metaData.push({
      association: 'PackImport',
      sourcePack: isPP ? 'MechvibesPlusPlus' : 'Mechvibes',
      id, name, key_define_type, includes_numpad
    })
  }
}

export async function handleUpload(files) {
  if (files == null) return console.warn('Invalid file drop') // text snippet or something

  let pack = {
    /***  Things added on build/publish  ***/
    //$schema: "include schema type",
    //integrity_hash: false, // as id: '', ?
    //creator: "",
    //creation_date: "", 
    //acknowledgments: [...],
    //license: "",

    /*** mostly guaranteed on import  ***/
    name: '',
    groups: {
      // these are defaults
      alpha: [ 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 36, 37, 38, 44, 45, 46, 47, 48, 49, 50 ],
      num: [ 2,3,4,5,6,7,8,9,10, 11 ],
      special: [ 0, 1, 14, 15, 28, 29, 42, 54, 56, 58, 3640, 3675, 3676 ],
      punctuation: [ 12, 13, 26, 27, 39, 40, 41, 43, 51, 52, 53 ],
      arrows: [ 57419, 57421, 57416, 57424 ],
      fKeys: [ 59, 60, 61, 62, 63, 64, 65, 66,  67, 68, 87, 88 ],
      wasd: [ 17, 30, 31, 32 ]
    },
    soundpackNames: {
      // shared sound files go in a 'common' sound directory
      // this allows for reuse across multiple keys and groups without having to dupe the file
      contentHash: {name:'sound file name', blob: 'valueTMP'} // may be full hash or appended to name (specifics don't matter as long as things line up)
    },
    assignment: {
      default: [],
    },
    metaData: [],
    assets: []
  }

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
        let config = JSON.parse(
          await isConfigJSON.async('text') || '{}'
        )

        // Mechvibes check
        if (isMechVibesConfig(config)) {
          // no good way to differentiate mouse vs key packs
          if (isMechVibesPPConfig(config)) {
            config.isPP = true
            console.log('Mechvibes PP')
          } else { 
            console.log('Mechvibes', config["key_define_type"])
          }
          return parseVibes(zip, config, pack)
        }
        
        // V2 check (will prob just have a schema key)
        return console.log('MechaKeys V2', config?.schema)
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
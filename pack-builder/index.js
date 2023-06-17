/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import JSZip from 'jszip'
import YAML from 'yaml'

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

let checkMechaKeysLegacy, isMechVibesConfig, isMechVibesPPConfig, getConfigYAML, getConfigJSON, isPPMouse;
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

  isPPMouse = (config) =>  {
    let definedKeys = new Set(Object.keys(config.defines).map(k => Number(k)))
    if (definedKeys.size <= 3 && definedKeys.has(1) && definedKeys.has(2)) return true
    return false
  }

  getConfigYAML = (zip) => {
    return zip.file(/[^\/]*\/config.(yaml|yml)/)?.[0] ?? false
  }

  getConfigJSON = (zip) => {
    return zip.file(/[^\/]*\/config.json/)?.[0] ?? false
  }
}

export let EE = {
  registered: [],
  emit: (v)=> {
    EE.registered.forEach(fn=>fn(v))
  },
  on: (fn) => {
    EE.registered.push(fn)
  }
}

let spHash, parseVibes, parseModelm, parseMechaKeysLegacy;
Parse_Packs: {
  spHash = (ogName, spData) => {
    return ogName + '_fakehash' //hash spData
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  let ffmpegRun = (ffmpeg, source, start, duration, outFile) => new Promise(
    async (resolve, reject) => ffmpeg.run(
      '-i', source,
      '-ss', start,
      '-t', duration,
      '-c', 'copy',
      outFile,
      '-y'
    ) 
    .then(_=>resolve(true))
    .catch(err=>reject(err.message))
  )


  EE.on(([count, len])=>{
    if(count%5) return
    console.clear()
    console.log((100*count/len|0)+'%')
  })
  parseVibes = async (zip, config, pack) => {
    let {id, name, key_define_type, includes_numpad, sound, defines, isPP} = config
    let virtualDir = {}

    if(key_define_type === 'single') {
      // init FFmpeg
      let FFmpeg = await import('https://esm.sh/@ffmpeg/ffmpeg')
      const ffmpeg = FFmpeg.createFFmpeg({
        mainName: 'main',
        corePath: 'https://unpkg.com/@ffmpeg/core-st/dist/ffmpeg-core.js'
      });

      // Load source sound
      let pattern = new RegExp(`.*/${escapeRegExp(sound)}$`)
      let sourceSound = await zip.file(pattern)?.[0]?.async?.("uint8array")
      let ext = sound.split('.').pop()

      let [count, len] = [0, Object.entries(defines).length]
      for(let [keyCode, timeData] of Object.entries(defines)) {
        if (!timeData) continue
        let [start, duration] = timeData.map(v=>''+v/1e3)

        let outFile = `${keyCode}.${ext}`

        let data;
        await ffmpeg.load().then(async _=>{
          await ffmpeg.FS('writeFile', sound, sourceSound);
          await ffmpegRun(ffmpeg, sound, start, duration, outFile).catch(err=>console.log(err));
          data = await ffmpeg.FS('readFile', outFile);
          await ffmpeg.exit()
        })

        let blobAudio = new Blob([data.buffer], { type: `audio/${ext}` })

        virtualDir[timeData[0]] = { 
          // this way we don't get redundant sound files for reuse
          name: `${timeData[0]}.${ext}`, // not a very helpful name... could concat keyCodes
          value: blobAudio
        }
         
        EE.emit([count+=1, len])
      }
    }

    pack.name = name
    for (let [keyCode, assignedVal] of Object.entries(defines)) {
      if (!assignedVal) continue

      let audioBlob, fileName;
      if(key_define_type === 'single') {
        let {name, value} = virtualDir[assignedVal[0]]
        fileName = name
        audioBlob = value
      } else {
        fileName = assignedVal
        let pattern = new RegExp(`.*/${escapeRegExp(fileName)}$`)
        audioBlob = await zip.file(pattern)?.[0]?.async?.("blob")
      }
      if (!audioBlob) continue

      let hashName = spHash(fileName, audioBlob)
      pack.soundNames[hashName] = {
        name: fileName,
        blob: audioBlob
      }

      let pressDir;
      if (config.isMouse) { // number of 0's prefixed is not uniform for mouse and keys
        pressDir = /^0[1-3]/.test(keyCode) ? 'up' : 'down'
        keyCode = 'M'+Number(keyCode)
      } else {
        pressDir = /^00[1-9]/.test(keyCode) ? 'up' : 'down'
        keyCode = Number(keyCode)
      }

      //how should i differentiate mouse vs keyboard keycodes?

      pack.assignment[keyCode] = {     // create obj if it doesn't exist
        ...pack.assignment?.[keyCode], // re-inherit if it did
        [pressDir]: [{                 // unless two downs were defined, we don't have to worry about overwriting as the are unique
          sounds: [hashName]
          //conditions, mods, and mixers for this sound set would go here
        }]
      }
    }
    

    pack.metaData.push({
      association: 'PackImport',
      sourcePack: isPP ? 'MechVibesPlusPlus' : 'MechVibes',
      id, name, key_define_type, includes_numpad
    })

    console.log(pack)
    return pack
  }

  let genModelMSoundArr = async (arr, zip, pack) => {
    let SoundArr = []
    for (let fileName of arr??[]) {
      let pattern = new RegExp(`.*/${escapeRegExp(fileName)}$`)
      let audioBlob = await zip.file(pattern)?.[0]?.async?.("blob")
      if (!audioBlob) return

      let hashName = spHash(fileName, audioBlob)
      pack.soundNames[hashName] = {
        name: fileName,
        blob: audioBlob
      }
      SoundArr.push(hashName)
    }
    return SoundArr
  }

  let resolveModelMKey = (regex, groupIndex) => {
    if (regex === '\\d+') {
      return 'default'
    } 
    if (Number(regex)) {
      return Number(regex)
    }
    if (/^(\d+\|)*\d+$/.test(regex)) { // ex: "1|34|680|421|543"
      let keyMatch = 'group_'+groupIndex.count
      pack.groups[keyMatch] = regex.split('|').map(Number)
      groupIndex.count++
      return Key_Match
    }
    // last resort is to just keep as regex
    return `/${regex}/`
  }

  parseModelm = async (zip, config, pack) => {
    let name = getPackName(zip)
    pack.name = name
    let groupIndex = {count: 0}

    for (let obj of config.switches) {

      let keyMatch = resolveModelMKey(obj.keycode_regex, groupIndex)

      let downSoundArr = genModelMSoundArr(obj.keydown_paths, zip, pack)
      let upSoundArr = genModelMSoundArr(obj.keyup_paths, zip, pack)

      pack.assignment[keyMatch] = {
        down: [{ sounds: downSoundArr }],
        up: [{ sounds: upSoundArr }]
      }
    }

    pack.metaData.push({
      association: 'PackImport',
      sourcePack: 'ModelM',
      name
    })

    console.log(pack)
    return pack
  }

  let getPackName = (zip)=>Object.keys(zip.files)[0].split('/')[0]

  let extendGroupsForLegacy = (groups) => {
    groups.space = [57]
    groups.enter = [28]
    groups.alt   = [56]
    groups.alpha = ['default']  
    // hmmm, can I alias default?

    groups.left  = ['M1']
    groups.right = ['M2']
    groups.middle= ['M3']
    // 'Mdefault' should there be a mouse default?
    // group.Mdefault = ['M1', 'M2', 'M3'] // ?
  }

  let genMKLSoundArr = async (zip, pack, group, dir) => {
    let SoundArr = []
    let pattern = new RegExp(`.*/${group}/${dir}`)

    for(let f of zip.file(pattern)) {
      let name = f.name.split('/').pop()
      let blob = await f?.async?.("blob")
      let hashName = await spHash(name, blob)

      pack.soundNames[hashName] = { name, blob }
      SoundArr.push(hashName)
    }

    return SoundArr
  }

  let parseByGroupMLK = async (groupArr, zip, pack) => {
    for(let group of groupArr) {
      let gName = group==='alpha' ? 'default' : group
      pack.assignment[gName] = {
        down: [{ sounds: await genMKLSoundArr(zip, pack, group, 'down') }],
        up: [{ sounds: await genMKLSoundArr(zip, pack, group, 'up') }]
      }
    }
  }

  parseMechaKeysLegacy = async (zip, packType, pack) => {
    let name = getPackName(zip)
    pack.name = name

    extendGroupsForLegacy(pack.groups)

    if (packType.isKeyPack) {
      parseByGroupMLK(['space', 'enter', 'alt', 'alpha'], zip, pack)
    }
    if (packType.isMousePack) {
      parseByGroupMLK(['left', 'right', 'middle'], zip, pack)
    }
    
    pack.metaData.push({
      association: 'PackImport',
      sourcePack: 'MechaKeys Legacy',
      name
    })

    console.log(pack)
    return pack
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

    /*** Mostly guaranteed on import  ***/
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
    soundNames: {
      // shared sound files go in a 'common' sound directory
      // this allows for reuse across multiple keys and groups without having to dupe the file
      /* contentHash: {
        name:'sound file name', 
        blob: 'valueTMP',
        refCount: 0 //?
      } */ // may be full hash or appended to name (specifics don't matter as long as things line up)
    },
    assignment: {
      default: [],
    },
    metaData: [],

    /*** Optional on import  ***/
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
    
      // ModelM
      if (isConfigYAML) {
        let config = YAML.parse(
          await isConfigYAML?.async('text') || ''
        ) ?? {switches: []} 
        // i should prob throw an error instead of pretending its an empty pack

        console.log('ModelM')
        return parseModelm(zip, config, pack)
      }
    
      // Mechvibes || MechvibesPP || MechaKeysV2
      if (isConfigJSON) {
        let config = JSON.parse(
          await isConfigJSON?.async('text') || '{}'
        )

        // Mechvibes check
        if (isMechVibesConfig(config)) {
          // no good way to differentiate mouse vs key packs
          if (isMechVibesPPConfig(config)) {
            config.isPP = true
            config.isMouse = isPPMouse(config)
            console.log('Mechvibes PP', ['keypack', 'mousepack'][+config.isMouse])
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
        console.log('MechaKeys Legacy', isMechaKeysLegacy)
        return parseMechaKeysLegacy(zip, isMechaKeysLegacy, pack)
      }
    
      return console.warn('failed to identify zip pack')
    }

    // pack

    // audio
  }
}
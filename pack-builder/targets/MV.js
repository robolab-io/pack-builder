let isMechVibesConfig, isMechVibesPPConfig, isPPMouse;
Pack_Detection : {
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
}


import ffmpeg from "ffmpeg.js";
import { escapeRegExp, EE, spHash } from "../Utils";
let parseVibes;
Parse_Packs: {
  parseVibes = async (zip, config, pack) => {
    let {id, name, key_define_type, includes_numpad, sound, defines, isPP} = config
    let virtualDir = {}

    if(key_define_type === 'single') {
      // Load source sound
      let pattern = new RegExp(`.*/${escapeRegExp(sound)}$`)
      let sourceSound = await zip.file(pattern)?.[0]?.async?.("uint8array")
      let ext = sound.split('.').pop()

      let [progress, len] = [0, Object.entries(defines).length]
      EE.emit('ffmpeg-update', [0, 1])

      for(let [keyCode, timeData] of Object.entries(defines)) {
        if (!timeData) continue
        let [start, duration] = timeData.map(v=>''+v/1e3)

        let outFile = `${keyCode}.${ext}`

        let result = ffmpeg({
          MEMFS: [{name: sound, data: sourceSound}],
          arguments: [
            '-i', sound,
            '-ss', start,
            '-t', duration,
            '-c', 'copy',
            outFile,
            '-y'
          ],
          printErr: ()=>{}, // hmmm
        })
        const out = result.MEMFS[0].data;
        let blobAudio = new Blob([out], {type: `audio/${ext}`})

        virtualDir[timeData[0]] = { 
          // this way we don't get redundant sound files for reuse
          name: `${timeData[0]}.${ext}`, // not a very helpful name... could concat keyCodes
          value: blobAudio
        }

        EE.emit('ffmpeg-update', [progress+=1, len])
      }
      EE.emit('ffmpeg-update', [0, 1])
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

    return pack
  }
}


export let isMVPack;
Handle_Upload: {
  isMVPack = async (zip, pack, config) => {
    if (isMechVibesConfig(config)) {
      if (isMechVibesPPConfig(config)) {
        config.isPP = true
        config.isMouse = isPPMouse(config)
        console.log('Mechvibes PP', ['keypack', 'mousepack'][+config.isMouse])
      } else {
        console.log('Mechvibes', config["key_define_type"])
      }
      return parseVibes(zip, config, pack)
    }
  }
}

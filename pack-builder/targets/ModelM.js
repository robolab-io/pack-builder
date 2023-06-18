
Pack_Detection : {
  /* 
    Just whether it has a yaml file.
    but thats in utils
  */
}


import { spHash, getPackName, escapeRegExp } from "../Utils";
let parseModelm;
Parse_Packs: {
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

      let downSoundArr = await genModelMSoundArr(obj.keydown_paths, zip, pack)
      let upSoundArr = await genModelMSoundArr(obj.keyup_paths, zip, pack)

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
}


import { getConfigYAML, parseYamlFile } from "../Utils";
let isMMPack;
Handle_Upload: {
  isMMPack = async (zip, pack) => {
    let isConfigYAML = getConfigYAML(zip)
    if (isConfigYAML) {
      let config = await parseYamlFile(isConfigYAML)

      console.log('ModelM')
      return parseModelm(zip, config, pack)
    }
  }
}


export {
  isMMPack
}
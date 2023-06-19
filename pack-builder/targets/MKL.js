let checkMechaKeysLegacy;
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
}


import { spHash, getPackName } from "../Utils";
let parseMechaKeysLegacy;
Parse_Packs: {
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

    if (packType.isKeyPack) await parseByGroupMLK(['space', 'enter', 'alt', 'alpha'], zip, pack)
    if (packType.isMousePack) await parseByGroupMLK(['left', 'right', 'middle'], zip, pack)
    
    pack.metaData.push({
      association: 'PackImport',
      sourcePack: 'MechaKeys Legacy',
      name
    })

    return pack
  }
}


export let isMKLPack;
Handle_Upload: {
  isMKLPack = (zip, pack) => {
    let isMechaKeysLegacy = checkMechaKeysLegacy(zip)
    if (Object.values(isMechaKeysLegacy).some(k=>k)) {
      console.log('MechaKeys Legacy', isMechaKeysLegacy)
      return parseMechaKeysLegacy(zip, isMechaKeysLegacy, pack)
    }
  }
}
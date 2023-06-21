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


export let downloadMKL;
Handle_Download : {

  let keyGroups = new Map([
    [['space' , 57],  'space'],
    [['enter' , 28],  'enter'],
    [['alt'   , 56],  'alt'  ],
    [['alpha' , 'default'],  'alpha'],
    [['left'  , 'M1'],  'left'  ],
    [['right' , 'M2'],  'right' ],
    [['middle', 'M3'],  'middle']
  ])

  downloadMKL = (zip, assignment, soundNames, name) => { 
    let out = {
      assignment: Object.fromEntries([...keyGroups.values()].map(k => [k, {down: [], up:[]}])),
      groups: Object.fromEntries([...keyGroups.keys()].map(([k,v])=>[k, [v]])),
      soundNames 
    }
    
    MKL_COMPAT_FORMAT : {
      let predefined = [...keyGroups.keys()].flat()
      for(let [key, soundObj] of Object.entries(assignment)) {
        // ensure numbers are ints post .entries()
        key = Number.isNaN(+key) ? key : Number(key)

        // properly assign to predefined legacy groups
        for(const [arr, outKey] of keyGroups) {
          let selectKey = out.assignment[outKey]
          if (arr.includes(key)) {
            selectKey.up = [...selectKey?.up??[], ...soundObj?.up??[]]
            selectKey.down = [...selectKey?.down??[] , ...soundObj?.down??[]]
          }
        }

        // default to alpha
        if (!predefined.includes(key)) {
          /*this is not ideal as any custom could end up here eg (mouseGroup[M1,M2,M3], specialKeyGroup[28,56,57])  
            We'd need to verify the contents of a group both here and maybe even above
          */
          let defaultKey = out.assignment['alpha']
          defaultKey.up = [...defaultKey?.up??[] , ...soundObj?.up??[]]
          defaultKey.down = [...defaultKey?.down??[] , ...soundObj?.down??[]]
        }
      }
    }

    Zip_Data : {
      for(let [MKLGroup, soundsObj] of Object.entries(out.assignment)) {
        for(let dir of ['up', 'down']) {
          let soundArr = new Set(soundsObj[dir].flatMap(obj=>obj.sounds))
          for (let soundHash of soundArr) {
            let path = `${name}/${MKLGroup}/${dir}/${soundHash}`
            let {blob} = soundNames[soundHash]
            zip.file(path, blob, { createFolders: true })
          }
        }
      }
    }

    return zip
  }
}
import JSZip from 'jszip'

export async function download(target, packState) {
  let zip = new JSZip()

  let { assignment, soundNames, name } = packState
  
  MKL : {
    let keyGroups = new Map([
      [['space', 57],  'space'],
      [['enter', 28],  'enter'],
      [['alt', 56],    'alt'],
      [['alpha', 'default'],  'alpha'],
      [['left',   'M1'],  'left'],
      [['right',  'M2'],  'right'],
      [['middle', 'M3'],  'middle']
    ])

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

    console.log(JSON.stringify(out))
    Zip_Data : {
      for(let [MKLGroup, soundsObj] of Object.entries(out.assignment)) {
        for(let dir of ['up', 'down']) {
          let soundArr = new Set(soundsObj[dir].flatMap(obj=>obj.sounds))
          for (let soundHash of soundArr) {
            let path = `${name}/${MKLGroup}/${dir}/${soundHash}`
            let {blob} = packState.soundNames[soundHash]
            zip.file(path, blob, { createFolders: true })
          }
        }
      }
    }
  }
  MM : { }
  MV : { }
  V2 : { }

  let res = await zip.generateAsync({type: 'blob'})
  return [res, `${name}.zip`]
}

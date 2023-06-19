/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import { baseScheme } from "./schema"
import { loadZip, getConfigJSON, parseJsonFile, spHash } from "./Utils"

import { isMMPack } from "./targets/ModelM"
import { isMVPack } from "./targets/MV"
import { isMKLPack } from "./targets/MKL"

export let packImport = async (file) => {
  let pack = baseScheme()
  let outPack, zip;

  if (!(zip ??= await loadZip(file))) return console.warn('Failed to parse zip')

  // ModelM
  if (outPack ??= await isMMPack(zip, pack)) return outPack

  // Mechvibes || MechvibesPP || MechaKeysV2
  let isConfigJSON = getConfigJSON(zip)
  if (isConfigJSON) {
    let config = await parseJsonFile(isConfigJSON)

    // Mechvibes check
    if (outPack ??= await isMVPack(zip, pack, config)) return outPack
    
    // V2 check
    return console.log('MechaKeys V2', config?.schema) // (will prob just have a schema key)
  }

  // MechaKeys
  if (outPack ??= await isMKLPack(zip, pack)) return outPack

  return console.warn('failed to identify zip pack')
}


export async function handleUpload(files) {
  if (files == null) return console.warn('Invalid file drop') // text snippet or something

  // Zip Pack
  if (files.length === 1 && files[0].type === "application/x-zip-compressed") {
    let file = files[0]
    let pack = await packImport(file)
    return ['pack', pack]
  }

  // Audio Upload
  let isAudioUpload = files.every(f=>/^audio\//.test(f.type))
  if (isAudioUpload) {
    let soundNames = files.reduce((a,c)=>({
      ...a,
      [spHash(c.name)]: { name: c.name, blob: c }
    }), {})
    return ['sound', soundNames]
  }

  // Directory
  if (true /*is directory*/) {
    // directories are a royal pain to deal with, just ignore for now\
    // https://stackoverflow.com/a/53058574
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
  }

  return console.warn('Invalid file drop')
}
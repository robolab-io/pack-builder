/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import { baseScheme } from "./schema"
import { loadZip, getConfigJSON, parseJsonFile } from "./Utils"

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
    return await packImport(file)
  }

  // Single Audio
  if (files.length === 1 && /^audio\//.test(files[0].type)) {
    /*Add to sound Names and return */
  }

  // Directory
  if (true /*is directory*/) {
    if (false /* All audio and No config*/) {
      /*Add all to sound Names and return */
    }

    if (false /*if config*/) {
      /* zip and import pack */
      // return await packImport(zip)
    }
  }

  return console.warn('Invalid file drop')
}
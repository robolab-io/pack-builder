let checkV2Pack;
Pack_Detection : {
  checkV2Pack = (zip) => {
    let isKeyPack;
    let isMousePack;
    return {isKeyPack, isMousePack}
  }
}


let parseV2Pack;
Parse_Packs: {
  parseV2Pack = async (zip, packType, pack) => {
    // parse code

    pack.metaData.push({
      association: 'PackImport',
      sourcePack: 'MechaKeys V2',
      name: ''
    })

    console.log(pack)
    return pack
  }
}


export let isV2Pack;
Handle_Upload: {
  isV2Pack = (zip, pack, config) => {
    
  }
}

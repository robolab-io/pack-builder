import YAML from 'yaml'
import JSZip from 'jszip'
import EventEmitter from 'events'


let getConfigYAML, getConfigJSON;
Pack_Detection : {
  getConfigYAML = (zip) => {
    return zip.file(/[^\/]*\/config.(yaml|yml)/)?.[0] ?? false
  }

  getConfigJSON = (zip) => {
    return zip.file(/[^\/]*\/config.json/)?.[0] ?? false
  }
}


let spHash, escapeRegExp, getPackName;
Parse_Packs: {
  spHash = (ogName, spData) => {
    return ogName + '_fakehash' //hash spData
  }

  escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  getPackName = (zip)=>Object.keys(zip.files)[0].split('/')[0]
}


let loadZip, parseYamlFile, parseJsonFile;
Handle_Upload: {
  loadZip = async (file) => {
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

  parseYamlFile = async (file) =>{
    let config = YAML.parse(
      await file?.async('text') || ''
    ) ?? {} 
    return config
  }

  parseJsonFile = async (file) =>{
    let config = JSON.parse(
      await file?.async('text') || '{}'
    )
    return config
  }


}


let EE = new EventEmitter()
export {
  getConfigYAML, getConfigJSON,
  EE,
  spHash, escapeRegExp, getPackName,
  loadZip
}
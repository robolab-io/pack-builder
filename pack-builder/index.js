/*
  type: "application/json" //json
  type: "" // .mecha
  type: "" // folder
  type: "application/x-zip-compressed" // robolab soundpack raw zip
  type: "audio/mpeg"  // mp3
*/
import JSZip from 'jszip'

let isMechaKeysV2Zip = () => { // && KeyTao
  
}

let isMechaKeysLegacyZip = () => {
  // has the form of 
  // /enter /space /alpha /alt (/style?)
  // /left /middle /right
}

let isMechVibesZip = () => {  // && rustyvibes

}

let isMechVibesPPZip = () => {

}

let isModelmZip = () => {
  // has yaml/ yml config
}

export function handleUpload(files) {
  if (files == null) return console.warn('Invalid file drop') // text snippet or something

  // for now ignore multi upload
  file: {
    let file = files[0]

    // zip
    if (file.type === "application/x-zip-compressed") {
      JSZip
        .loadAsync(file)
        .then( zip => {
          zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.dir) return
            console.log( zipEntry )
          });
        })
        .catch( err => {
          console.error(err.message)
        });
    }

    // pack

    // audio
  }
}
/*
  soundNames: {
    shared sound files go in a 'common' sound directory
    this allows for reuse across multiple keys and groups without having to dupe the file
    may be full hash or appended to name (specifics don't matter as long as things line up)
  }
*/

export let baseScheme = ()=>structuredClone({
  /*** Mostly guaranteed on creation/import/export  ***/
  name: '',
  groups: { },
  soundNames: {/*
    contentHash: { // could be not human readable hash
      name:'Display name', 
      blob: 'valueTMP'  // blob location for interim, saved to file(s) on export
    }
  */},
  assignment: {
    default: {},
  },
  metaData: [],

  /*** Optional on import  ***/
  assets: []
})


export let defaultGroups = ()=>structuredClone({
  alpha: [ 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 36, 37, 38, 44, 45, 46, 47, 48, 49, 50 ],
  num: [ 2,3,4,5,6,7,8,9,10, 11 ],
  special: [ 0, 1, 14, 15, 28, 29, 42, 54, 56, 58, 3640, 3675, 3676 ],
  punctuation: [ 12, 13, 26, 27, 39, 40, 41, 43, 51, 52, 53 ],
  arrows: [ 57419, 57421, 57416, 57424 ],
  fKeys: [ 59, 60, 61, 62, 63, 64, 65, 66,  67, 68, 87, 88 ],
  wasd: [ 17, 30, 31, 32 ],
  default: [ 'default', '/\d+/' ],
  mouse: ['M1', 'M2', 'M3']
})


export let exportData = ()=>structuredClone({
  /***  Things added on build/publish  ***/
  $schema: null,
  integrity_hash: null,
  id: null,
  creator: null,
  creation_date: null,

  acknowledgments: null,
  license: null
})

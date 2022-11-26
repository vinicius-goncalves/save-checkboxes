export { Checkbox, CheckboxManager }
 
const STORE_NAME = 'checkboxes'
const STORE_VERSION = 1
const OBJECT_STORE_NAME = 'saved-checkboxes'

const db = indexedDB.open(STORE_NAME, STORE_VERSION)

const dbPromise = new Promise(resolve => {

    db.addEventListener('upgradeneeded', (event) => {
    
        const dbResult = event.target.result
        if(!dbResult.objectStoreNames.contains('saved-checkboxes')) {
            const store = dbResult.createObjectStore('saved-checkboxes', { autoIncrement: true })
            store.createIndex('checkboxIndex', 'id', { unique: true })
        }
    })

    db.addEventListener('success', (event) => {
      
        const dbResult = event.target.result
        resolve(dbResult)
        
    })
})

function makeTransaction(objectStore, callback, readMode = 'readonly') {
    
    dbPromise.then(db => {
        const transaction = db.transaction(objectStore, readMode)
        const store = transaction.objectStore(objectStore)
        callback(store)

    })
}

function Checkbox(id, checkDate) {
    this.id = id
    this.checkDate = checkDate
}

function CheckboxManager () {
    this.saveCheckbox = function saveCheckbox(id) {

        makeTransaction(OBJECT_STORE_NAME, store => {
            console.log(store)
        })

    }
}
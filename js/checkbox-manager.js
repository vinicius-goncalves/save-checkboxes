export { Checkbox, CheckboxDataCache, CheckboxManager, CheckboxStored }
 
const STORE_NAME = 'checkboxes'
const STORE_VERSION = 1
const OBJECT_STORE_NAME = 'saved-checkboxes'

const db = indexedDB.open(STORE_NAME, STORE_VERSION)

const dbPromise = new Promise(resolve => {

    db.addEventListener('upgradeneeded', (event) => {
    
        const dbResult = event.target.result
        if(!dbResult.objectStoreNames.contains('saved-checkboxes')) {
            const store = dbResult.createObjectStore('saved-checkboxes', { keyPath: 'id' })
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

function CheckboxStored(textNodeContent) {
    this.textNodeContent = textNodeContent
}

function CheckboxManager () {

    this.getCheckbox = function getCheckbox(id, callback) {

        makeTransaction(OBJECT_STORE_NAME, store => {
        
            const query = store.get(id)
            query.addEventListener('success', (event) => {
                callback(event.target.result)
            })
        })
    }

    this.saveCheckbox = function saveCheckbox(checkboxObj) {

        makeTransaction(OBJECT_STORE_NAME, store => {
            store.put(checkboxObj).addEventListener('success', () => {
                this.getCheckbox(checkboxObj.id, checkboxAdded => {
                    return checkboxAdded
                })
            })
        }, 'readwrite')
    }

    this.getAllItems = function(callback) {
        makeTransaction(OBJECT_STORE_NAME, store => {
            store.getAll().addEventListener('success', (event) => {
                callback(event.target.result)
            })
        })
    }

    this.deleteCheckbox = function(id) {
        makeTransaction(OBJECT_STORE_NAME, store => {
            
            const openedCursor = store.openCursor()
            openedCursor.addEventListener('success', (event) => {
                
                const cursor = event.target.result
                if(!cursor) {
                    return console.log('Finished')
                }
                
                if(cursor.value.id == id) {
                    cursor.delete().addEventListener('success', () => {
                        console.info(`[!!] Checkbox "${id}" was deleted.`)
                        return
                    })
                }

                cursor.continue()
                
            })
        }, 'readwrite')
    }
}

function CheckboxDataCache() {

    this.startCache = function(callback) {
        caches.open('checkboxes').then(cache => {
            callback(cache)
        })
    }

    this.findCheckbox = function(id, callback) {
        this.startCache(cache => {
            cache.match(id).then(result => {
                callback(result)
            })
        })
    }
}
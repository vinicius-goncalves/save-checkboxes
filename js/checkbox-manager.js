import { getFactorial, randomID } from './utils.js'
export { Checkbox, CheckboxDataCache, CheckboxManager, CheckboxCreator }
 
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

function CheckboxCreator(id) {
    this.id = id
    this.createdWhen = Date.now()
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

    CheckboxDataCache.globalFlag = false
    CheckboxDataCache.loopAttemps = 0

    function requestLink(id) { 
        return `${window.origin}/checkboxes/${String(id)}.json`
    }

    this.startCache = async function() {
        const cache = await caches.open('checkboxes')
        return cache
    }
    
    this.findCheckbox = async function(id) {
        const cache = await this.startCache()
        const cacheMatched = await cache.match(new Request(`${window.origin}/checkboxes/${id}.json`))
        if(!cacheMatched || !cacheMatched.ok) { return }
        const checkboxObject = await cacheMatched.json()
        return checkboxObject
    }
    
    this.putCheckbox = async function(checkboxObj) {
        
        CheckboxDataCache.currentID = checkboxObj.id
        
        do {

            const cacheFound = await this.findCheckbox(CheckboxDataCache.currentID)

            if(!cacheFound) {

                const cache = await this.startCache()
                const hds = new Headers({
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(checkboxObj).length / 1024
                })

                const request = new Request(requestLink(CheckboxDataCache.currentID), { headers: hds } )
                const response = new Response(JSON.stringify(checkboxObj), { 
                    headers: hds,
                    status: 200,
                    statusText: 'Ok'
                })

                CheckboxDataCache.globalFlag = true
                await cache.put(request, response)
                return {
                    created: true,
                    identify: CheckboxDataCache.currentID,
                    finishedWhen: Date.now()
                }
            }

            if(CheckboxDataCache.loopAttemps > getFactorial(CheckboxDataCache.currentID.length) || CheckboxDataCache.loopAttemps > Number.MAX_SAFE_INTEGER) {
                console.log('The attemps was filled up, breaked')
                break
            }
            
            console.log(`An checkbox with ID ${CheckboxDataCache.currentID} already exists`)
            CheckboxDataCache.currentID = randomID(6)
            CheckboxDataCache.globalFlag = false
            CheckboxDataCache.loopAttemps++

        } while(!CheckboxDataCache.globalFlag)
    }

    this.getAllCheckboxes = async function(callback) {
        
        try {

            const cache = await this.startCache()
            const allMatches = await cache.matchAll()
            const promises = allMatches.map(responseObj => responseObj.json())
            const promisesResolved = await Promise.all(promises)
            callback(promisesResolved)
    
        } catch (error) {

        }
    }
}
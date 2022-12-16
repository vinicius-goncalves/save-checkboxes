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

function makeTransaction(objectStore, readMode = 'readonly') {
    
    return new Promise(async (resolve) => {
        const db = await dbPromise
        const transaction = db.transaction(objectStore, readMode)
        const store = transaction.objectStore(objectStore)
        resolve(store)
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

    this.getCheckbox = async function getCheckbox(id) {

        return new Promise(async (resolve) => {

            const store = await makeTransaction(OBJECT_STORE_NAME)
            const query = store.get(id)

            function returnCheckbox(event) {
                const { result } = event.target
                resolve(result)
            }

            query.addEventListener('success', returnCheckbox.bind(this))
            
        })
    }

    this.saveCheckbox = function saveCheckbox(checkboxObj) {

        return new Promise(async (resolve) => {
            const store = await makeTransaction(OBJECT_STORE_NAME, 'readwrite')
            const query = store.put(checkboxObj)
            query.addEventListener('success', async () => {
                const checkboxAdded = await this.getCheckbox(checkboxObj.id)
                resolve(checkboxAdded)
            })
        })
    }

    this.getAllItems = async function getAllItems() {
        return new Promise(async (resolve) => {
            const store = await makeTransaction(OBJECT_STORE_NAME)
            store.getAll().addEventListener('success', (event) => {
                resolve(event.target.result)
            })
        })
    }

    this.deleteCheckbox = async function(id) {
        const store = await makeTransaction(OBJECT_STORE_NAME, 'readwrite')
            
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
    }
}

function CheckboxDataCache() {

    CheckboxDataCache.globalFlag = false
    CheckboxDataCache.loopAttempts = 0

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

            if(CheckboxDataCache.loopAttempts > getFactorial(CheckboxDataCache.currentID.length) || CheckboxDataCache.loopAttempts > Number.MAX_SAFE_INTEGER) {
                console.log('The attempts was filled up, the loop was broke')
                break
            }
            
            console.log(`An checkbox with ID ${CheckboxDataCache.currentID} already exists`)
            CheckboxDataCache.currentID = randomID(6)
            CheckboxDataCache.globalFlag = false
            CheckboxDataCache.loopAttempts++

        } while(!CheckboxDataCache.globalFlag)
    }

    this.getAllCheckboxes = async function() {
        
        try {

            const cache = await this.startCache()
            const allMatches = await cache.matchAll()
            const promises = allMatches.map(responseObj => responseObj.json())
            const promisesResolved = await Promise.all(promises)
            return promisesResolved
    
        } catch (error) {
            console.log(error)
        }
    }
}
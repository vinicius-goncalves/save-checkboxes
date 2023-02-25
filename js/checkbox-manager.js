import { getFactorial, randomID } from './utils.js'
export { Checkbox, CheckboxManager }

const STORE_NAME = 'checkboxes'
const STORE_VERSION = 1

const db = indexedDB.open(STORE_NAME, STORE_VERSION)

const dbPromise = new Promise(resolve => {

    db.addEventListener('upgradeneeded', (event) => {
    
        const dbResult = event.target.result
        const { objectStoreNames } = dbResult

        if(!objectStoreNames.contains('boxes-checked')) {
            const store = dbResult.createObjectStore('saved-checkboxes', { keyPath: 'id' })
            store.createIndex('checkboxIndex', 'id', { unique: true })
        }

        if(!objectStoreNames.contains('all-checkboxes')) {
            const store = dbResult.createObjectStore('all-checkboxes', { keyPath: 'id' })
            store.createIndex('checkboxIndex', 'id', { unique: true }) 
        }
    })

    db.addEventListener('success', (event) => {
      
        const dbResult = event.target.result
        resolve(dbResult)
        
    })
})

async function makeTransaction(objectStore, readMode = 'readonly') {
    const db = await dbPromise
    const transaction = db.transaction(objectStore, readMode)
    const store = transaction.objectStore(objectStore)
    return Promise.resolve(store)
}

function Checkbox(id, checkedTimestamp) {
    this.id = id
    this.checkedTimestamp = checkedTimestamp
}

class CheckboxManager {

    constructor(storeName) {
        this.storeName = storeName
    }

    async get(id) {

        const store = await makeTransaction(this.storeName, 'readonly')
        
        const key = IDBKeyRange.only(id)
        const cursorOpened = store.openCursor(key)

        return new Promise(resolve => {

            cursorOpened.addEventListener('success', (event) => {
            
                const { ['result']: cursor } = event.target
                resolve(cursor ? cursor.value : "The query didn't return any values")
    
            })
        })
    }

    set(checkboxInstance) {

        return new Promise(async (resolve) => {


            const store = await makeTransaction(this.storeName, 'readwrite')
            const query = store.put(checkboxInstance)
            
            query.onsuccess = () => resolve(this)

        })
    }

    getAll() {

        return new Promise(async (resolve) => {

            const store = await makeTransaction(this.storeName)
            const query = store.getAll()

            query.addEventListener('success', (event) => {

                const result = event.target.result
                const alternativeArr = Array.prototype.map.call(result, (checkboxes) => checkboxes)

                resolve(Array.isArray(result) ? result : alternativeArr)

            })
        })
    }

    async deleteCheckbox(id) {

        if(typeof id === 'undefined') {
            console.error('The ID for delete a checkbox is undefined.')
            return
        }

        const store = await makeTransaction(storeName, 'readwrite')
        const openedCursor = store.openCursor()

        function deleteCheckboxFunc(event) {
            const cursor = event.target.result
            if(!cursor) {
                return console.log('Finished')
            }
            
            if(cursor.value.id != id) {
                cursor.continue()
                return
            }

            const deleteResult = cursor.delete()
            deleteResult.addEventListener('success', () => {
                console.info(`[!!] Checkbox "${id}" was deleted.`)
                return
            })
        }
        
        openedCursor.addEventListener('success', deleteCheckboxFunc.bind(this))
    }
}

const allCheckboxes = new CheckboxManager('all-checkboxes')
allCheckboxes.get(0.115772546617215303).then(r => console.log(r))

// function CheckboxDataCache() {

//     CheckboxDataCache.globalFlag = false
//     CheckboxDataCache.loopAttempts = 0

//     function reqURL(id) {
//         const url = new URL(`${window.origin}/checkboxes/${id}.json`)
//         return url
//     }

//     this.startCache = async function() {
//         const cache = await caches.open('checkboxes')
//         return cache
//     }
    
//     this.findCheckbox = async function(id) {

//         const cache = await this.startCache()

//         const req = new Request(reqURL(id))
//         const cacheMatched = await cache.match(req)

//         if(!cacheMatched || !cacheMatched.ok) { 
//             return 
//         }

//         const checkboxObject = await cacheMatched.json()
//         return checkboxObject
//     }
    
//     this.putCheckbox = async function(checkboxObj) {
        
//         CheckboxDataCache.currentID = checkboxObj.id
        
//         do {

//             const cacheFound = await this.findCheckbox(CheckboxDataCache.currentID)

//             if(!cacheFound) {

//                 const cache = await this.startCache()

//                 const hds = new Headers({
//                     'Content-Type': 'application/json',
//                     'Content-Length': JSON.stringify(checkboxObj).length / 1024
//                 })

//                 const request = new Request(reqURL(CheckboxDataCache.currentID), { headers: hds } )
//                 const response = new Response(JSON.stringify(checkboxObj), { 
//                     headers: hds,
//                     status: 200,
//                     statusText: 'Ok'
//                 })

//                 CheckboxDataCache.globalFlag = true
//                 await cache.put(request, response)

//                 return {
//                     created: true,
//                     identify: CheckboxDataCache.currentID,
//                     finishedWhen: Date.now()
//                 }
//             }

//             if(CheckboxDataCache.loopAttempts > getFactorial(CheckboxDataCache.currentID.length) || CheckboxDataCache.loopAttempts > Number.MAX_SAFE_INTEGER) {
//                 console.log('The attempts were filled up, the loop was broke')
//                 break
//             }
            
//             console.log(`An checkbox with ID ${CheckboxDataCache.currentID} already exists`)
//             CheckboxDataCache.currentID = randomID(6)
//             CheckboxDataCache.globalFlag = false
//             CheckboxDataCache.loopAttempts++

//         } while(!CheckboxDataCache.globalFlag)
//     }

//     this.getAllCheckboxes = async function() {
        
//         try {

//             const cache = await this.startCache()
//             const allMatches = await cache.matchAll()
//             const promises = allMatches.map(responseObj => responseObj.json())
//             const promisesResolved = await Promise.all(promises)
//             return promisesResolved
    
//         } catch (error) {
//             console.error(error)
//         }
//     }
// }
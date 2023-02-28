import { randomID } from './utils.js'
export { Checkbox, CheckboxNamed, CheckboxManager }

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

class Checkbox {

    constructor(id = randomID(6)) {
        this.id = id
        this.checkedTimestamp = Date.now()
    }
}

class CheckboxNamed extends Checkbox {
    constructor(id, name) {
        super(id)
        this.name = name
    }
}

class CheckboxManager {

    #storeName

    constructor(storeName) {
        this.#storeName = storeName
    }

    async #makeTransaction(objectStore, readMode = 'readonly') {
        const db = await dbPromise
        const transaction = db.transaction(objectStore, readMode)
        const store = transaction.objectStore(objectStore)
        return Promise.resolve(store)
    }

    async search(id) {

        const store = await this.#makeTransaction(this.#storeName, 'readonly')
        const key = IDBKeyRange.only(id)
        const cursorOpened = store.openCursor(key)

        return new Promise(resolve => {

            cursorOpened.addEventListener('success', (event) => {
            
                const { ['result']: cursor } = event.target

                const resolveObj = cursor 
                    ? { found: true, value: cursor.value } 
                    : { found: false, message: "The query didn't return any values.", searchedId: id }

                resolve(resolveObj)
    
            })
        })
    }

    async bulkSearch(...ids) {
        return Promise.all(ids.map(async (id) => (await this.search(id))))
    }

    add(checkboxInstance) {

        return new Promise(async (resolve) => {

            const { id } = checkboxInstance

            const store = await this.#makeTransaction(this.#storeName, 'readwrite')
            const query = store.add(checkboxInstance)
            
            query.onsuccess = () => resolve(this)
            query.onerror = () => console.error(`It was not possible to add the checkbox with the ID ${id}.`)

        })
    }

    getAll() {

        return new Promise(async (resolve) => {

            const store = await this.#makeTransaction(this.#storeName)
            const query = store.getAll()

            query.addEventListener('success', (event) => {

                const result = event.target.result
                const alternativeArr = Array.prototype.map.call(result, (checkboxes) => checkboxes)

                resolve(Array.isArray(result) ? result : alternativeArr)

            })
        })
    }

    async delete(id) {

        if(id === undefined) console.error("The ID's checkbox must not be empty.")

        const store = await this.#makeTransaction(this.#storeName, 'readwrite')
        const key = IDBKeyRange.only(id)
        const openedCursor = store.openCursor(key)

        openedCursor.addEventListener('success', (event) => {
            
            const { ['result']: cursor } = event.target
    
            if(!cursor) {
                console.warn(`The checkbox with the ID "${id}" doesn't exist.`)
                return
            }
    
            const deleteResult = cursor.delete()
            deleteResult.onsuccess = () => console.info(`[!!] Checkbox "${id}" was deleted.`)

        })
    }
}
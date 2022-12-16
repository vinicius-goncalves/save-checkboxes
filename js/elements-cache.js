import elements from '../data/elements.json' assert { type: 'json' }
export { Elements }

function Elements() {
    
    async function startCache() {
        const cache = await caches.open('elements')
        return cache
    }

    function getCacheMatchArgs(type) {

        const bodyContent = JSON.stringify(elements)

        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Content-Length', Math.floor(bodyContent.length / 1024))

        return {
            'request': new Request(
                    `${window.origin}/data/elements.json`, 
                    { headers }),
            'response': new Response(
                JSON.stringify(elements), { 
                    headers,
                    status: 200,
                    statusText: 'Ok' 
                })
        }[type]
    }

    this.getElementsIntoCache = async function() {
        
        const request = getCacheMatchArgs('request')
        const cache = await startCache()
        const cacheFound = await cache.match(request)
        
        //If this happened, this means elements don't not exist into caches
        if(!cacheFound) {
            
            const response = getCacheMatchArgs('response')
            
            try {
                
                await cache.put(request, response)
                console.log('Elements have inserted in cache.')

                const cacheFound = await cache.match(request)
                const elsDeserialized = await cacheFound.json()
                return elsDeserialized

            } catch (error) {
                console.log(error)
            }

            return
        }

        //Now, if this happened, this means the cache was found..
        //But the there was a problem with the request
        if(!cacheFound.ok || cacheFound.status > 300) {
            throw console.error('There was a problem with cache elements request.')
        }

        const elsIntoCache = await cacheFound.json()
        return elsIntoCache

    }
}
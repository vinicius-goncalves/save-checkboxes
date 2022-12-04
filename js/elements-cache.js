import elements from '../data/elements.json' assert { type: 'json' }

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
        
        const cache = await startCache()
        const foundCache = await cache.match(`${window.origin}/data/elements.json`)
        if(foundCache) {
            foundCache.json().then(data => {
                console.log(data)
            })
        }
    }
}
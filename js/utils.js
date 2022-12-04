export { randomID, getFactorial }

function getChar(type) {

    let char = null
    
    switch(type) {
        case 'letters':
            char = Math.floor(Math.random() * 26) + 97
            break
        case 'numbers':
            char = Math.floor(Math.random() * (9 - 0) + 0)
            break
        default:
            break
    }

    return char
}

function randomID(len) {
    
    const charsType = ['letters', 'numbers']

    const chars = Array.from({ length: len }).fill(undefined).map(() => {
        
        const randomType = charsType[Math.floor(Math.random() * charsType.length)]
        const randomChar = getChar(randomType)
        const fixedChar = randomChar >= 10 ? String.fromCharCode(randomChar) : randomChar
        return fixedChar

    })

    return chars.map(char => {
        if(typeof char !== 'number') {
            return Math.random() > .5 ? char.toUpperCase() : char.toLowerCase()
        }
        return char
    }).join('')

}

function randomUUID() {
    
    let dateTime = Date.now()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = Math.floor(Math.random() * 16) % 16 | 0
        dateTime = dateTime / 16
        return (char === 'x' ? random : (random & 0x3 | 0x8)).toString(16)  
    })
    return uuid
}

function getFactorial(number) {
    if(number !== 1) {
        return getFactorial(number - 1) * number
    }
    return 1
} 

/** 
* Create a new DOM element
* @param {object} elementObj - An object with the element details 
*
*
*
*/

const obj = {
    div: {
        width: '325px',
        height: '325px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        'z-index': 25,
        style: {
            backgroundColor: '#ff00ff',
            color: '#ffffff'
        }
    }
}

export function createElement(elementObj) {
    
    const elementToCreate = Object.keys(elementObj)[0]
    const elementAttributes = Object.values(elementObj)[0]

    const el = document.createElement(elementToCreate)

    for(let attribute in elementAttributes) {
        
        const attributeValue = elementAttributes[attribute]
        el.setAttribute(attribute, attributeValue)
        
        if(attribute.indexOf('style') >= 0) {
            for(let styleProperty in attributeValue) {
                el.style.setProperty(styleProperty, attributeValue[styleProperty])
            }
        }
    }
    
    return el
}

function getSize(size) {

    const sizePrefix = size !== 0
        ? Math.floor(Math.log(size) / Math.log(1024))
        : 0
        
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
        'PT'
    ]

    console.log(size / Math.pow(1024, sizePrefix))

    return sizes.indexOf(sizes[sizePrefix]) === -1
        ? 'Unkown'
        : parseFloat(size / Math.pow(1024, sizePrefix)) + sizes[sizePrefix]
    
}
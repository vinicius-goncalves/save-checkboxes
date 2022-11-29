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

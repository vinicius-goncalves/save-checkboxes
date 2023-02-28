export { randomID, createElement }

const randomLetter = () => String.fromCharCode(Math.floor((Math.random() * 26) + 65))

function randomID(length) {

    const newArr = Array.from({ length }).fill(undefined)
    
    const mapCallback = () => {
        const letter = randomLetter()
        return Math.random() > .5 ? letter.toLowerCase() : letter
    }

    const randomArrLetters = newArr.map(mapCallback)

    return randomArrLetters.join('')
}

function createElement(newElement) {

    const newFragment = document.createDocumentFragment()

    const [ element, attributes ] = Object.entries(newElement)[0]
    const DOMElement = document.createElement(element)

    Object.entries(attributes).forEach(([ attr, value ]) => {

        DOMElement.setAttribute(attr, value)
        newFragment.appendChild(DOMElement)

    })
    
    return DOMElement
}
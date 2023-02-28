import exampleCheckboxes from '../data/checkboxes.json' assert { type: 'json' }

import { Checkbox, CheckboxManager, CheckboxNamed } from './checkbox-manager.js'
import { createElement } from './utils.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')
const newCheckboxBtn = document.querySelector('.new-checkbox')

const allCheckboxes = new CheckboxManager('all-checkboxes')
const savedCheckboxes = new CheckboxManager('saved-checkboxes')

;(async () => {
    
    const queryItems = await allCheckboxes.bulkSearch(1, 2, 3)
    
    queryItems.forEach((queryResult, index) => {

        const { found } = queryResult

        if(found) {
            return            
        }

        const { id, textNodeContent } = exampleCheckboxes[index]
        const checkbox = new CheckboxNamed(id, textNodeContent)
        allCheckboxes.add(checkbox)

    })
    
})()

async function loadCheckedBoxes() {

    const checkboxesChecked = await savedCheckboxes.getAll()

    if(!Array.isArray(checkboxesChecked)) {
        return
    }

    checkboxesChecked.forEach(item => {

        const { id } = item

        const itemWrapper = document.querySelector(`[data-id="${id}"]`)
        const inputElement = itemWrapper.querySelector('input')
        
        inputElement.checked = true
        
    })
} 

async function createCheckboxes() {

    const checkboxes = await allCheckboxes.getAll()

    const DOMElementsTemplate = {
        CHECKBOX_WRAPPER: {
            label: {
                class: 'checkbox-wrapper'
            }
        },
        INPUT_CHECKBOX: {
            input: {
                type: 'checkbox'
            }
        },
        SPAN_CHECKBOX: {
            span: {
                class: 'checkbox-span'
            }
        }
    }

    const { CHECKBOX_WRAPPER, INPUT_CHECKBOX, SPAN_CHECKBOX } = DOMElementsTemplate

    checkboxes.forEach(checkbox => {

        const { id, name } = checkbox

        const label = createElement(CHECKBOX_WRAPPER)
        label.setAttribute('data-id', id)
        
        const input = createElement(INPUT_CHECKBOX)

        const span = createElement(SPAN_CHECKBOX)
        const txtContent = document.createTextNode(name || id)
        
        span.appendChild(txtContent)
        label.append(input, span)

        mainCheckboxes.appendChild(label)

    })

    loadCheckedBoxes()
}

window.onload = () => createCheckboxes()

newCheckboxBtn.addEventListener('click', async () => {
    
    const checkbox = new Checkbox()
    const { id } = checkbox

    try {

        await allCheckboxes.add(checkbox)

    } finally {

        const label = document.createElement('label')
        label.setAttribute('class', 'checkbox-wrapper')
        label.setAttribute('data-id', id)
    
        const input = document.createElement('input')
        input.setAttribute('type', 'checkbox')
        
        const span = document.createElement('span')
        span.setAttribute('class', 'checkbox-span')
    
        const textNode = document.createTextNode(id)
        span.appendChild(textNode)
    
        label.append(input, span)
    
        mainCheckboxes.appendChild(label)
    }
})

async function saveCheckboxClicked(event) {
    
    const targetClicked = event.target

    if(targetClicked.type !== 'checkbox') {
        return
    }

    const closestDataId = targetClicked.closest('[data-id]')

    const { id } = closestDataId.dataset
    const checkbox = new Checkbox(id)

    const query = await savedCheckboxes.search(id)

    if(query.found) {
        await savedCheckboxes.delete(id)
        return
    }

    try {
        await savedCheckboxes.add(checkbox)
        console.log(`Saved checkbox with ID "${id}"`)
    } catch (err) {
        console.log(err)
    } finally {
        console.log('All processes was finished')
    }
}

mainCheckboxes.onclick = (event) => saveCheckboxClicked(event)

window.addEventListener('resize', () => {
    
    const isLower = document.documentElement.clientWidth < 401
    const informationContent = document.querySelector('.information-content')
    const classListInformationContent = informationContent.classList

    classListInformationContent.toggle('active', isLower)

    if(isLower && classListInformationContent.contains('active')) {
        setTimeout(() => classListInformationContent.remove('active'), 3500)
    }
})

mainCheckboxes.addEventListener('scroll', () => {
    
    const scrollTop = mainCheckboxes.scrollTop || 0
    const maxClientHeightScroll = (mainCheckboxes.scrollHeight - mainCheckboxes.clientHeight) || 0
    const percentage = Math.abs((scrollTop / maxClientHeightScroll) * 100)

    const scrollBarContent = document.querySelector('.scrollbar-content')
    const scrollBarStyle = scrollBarContent?.style
    scrollBarStyle.setProperty('width', `${percentage}%`)

})

;(() => {

    class Coords {

        #x
        #y
        
        constructor(x, y) {
            
            this.#x = x
            this.#y = y
            
        }

        getX() {
            return this.#x
        }

        setX(value) {
            this.#x = value
            return this
        }

        getY() {
            return this.#y
        }

        setY(value) {
            this.#y = value
            return this
        }
    }

    class Swapping extends Coords {

        #isSwapping
        #prevScroll

        constructor(x, y, isSwapping) {
            super(x, y)
            this.#isSwapping = isSwapping
            this.#prevScroll = 0
        }

        get isSwapping() {
            return this.#isSwapping
        }

        set isSwapping(value) {
            this.#isSwapping = value
            return this
        }

        getPrevScroll() {
            return this.#prevScroll
        }

        setPrevScroll(value) {
            this.#prevScroll = value
        }

        get [Symbol.toStringTag]() {
            return 'Swapping'
        }
    }

    const swapping = new Swapping(0, 0, false)

    mainCheckboxes.addEventListener('mousedown', (event) => {

        swapping.isSwapping = true
        swapping.setY(event.clientY) 
        swapping.setPrevScroll(mainCheckboxes.scrollTop)

    })

    window.addEventListener('mousemove', (event) => {
        if(swapping.isSwapping) {
            mainCheckboxes.scrollTop = swapping.getPrevScroll() - (event.clientY - swapping.getY())
            mainCheckboxes.style.setProperty('pointer-events', 'none')
        }
    })
    
    window.addEventListener('mouseup', () => {
        if(swapping.isSwapping) {
            swapping.isSwapping = false
            mainCheckboxes.style.setProperty('pointer-events', 'auto')
        }
    })

})()
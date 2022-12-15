import { Checkbox, CheckboxManager, CheckboxDataCache, CheckboxCreator } from './checkbox-manager.js'
import { Elements } from './elements-cache.js'
import { randomID, createElement } from './utils.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')
const addCheckboxButton = document.querySelector('.add-checkbox')

const checkboxManager = new CheckboxManager()
const checkboxDataCache = new CheckboxDataCache()
const elements = new Elements()

async function createCheckboxes(els) {

    const checkboxes = await checkboxDataCache.getAllCheckboxes()
    checkboxes.forEach(checkbox => {

        const { id } = checkbox

        const label = createElement(els.CHECKBOX_WRAPPER)
        label.setAttribute('data-id', id)
        
        const input = createElement(els.INPUT_CHECKBOX)

        const span = createElement(els.SPAN_CHECKBOX)
        const txtContent = document.createTextNode(id)
        
        span.appendChild(txtContent)
        label.append(input, span)

        mainCheckboxes.appendChild(label)

    })

    checkboxManager.getAllItems(items => {
        items.forEach(item => {
            document.querySelector(`[data-id="${item.id}"]`).querySelector('input').setAttribute('checked', 'true')
        })
    })
}

async function handleWithInitialElements() {

    const els = await elements.getElementsIntoCache()

    const script = createElement(els.CHECKBOX_MANAGER_FILE)
    docBody.insertAdjacentElement('beforeend', script)

    createCheckboxes(els)

}

window.addEventListener('DOMContentLoaded', () => {
    handleWithInitialElements()
        
})

addCheckboxButton.addEventListener('click', async () => {

    const id = randomID(5)
    const checkbox = new CheckboxCreator(id)
    const creationResult = await checkboxDataCache.putCheckbox(checkbox)
    const { created, identify } = creationResult

    if(!created) { return }

    const label = document.createElement('label')
    label.setAttribute('class', 'checkbox-wrapper')
    label.setAttribute('data-id', String(identify))

    const input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    
    const span = document.createElement('span')
    span.setAttribute('class', 'checkbox-span')

    const textNode = document.createTextNode(identify)
    span.appendChild(textNode)

    label.append(input, span)

    mainCheckboxes.appendChild(label)

})

mainCheckboxes.addEventListener('click', (event) => {

    const targetClicked = event.target
    if(targetClicked.type !== 'checkbox') {
        return
    }

    const closestDataId = targetClicked.closest('[data-id]')
    const id = closestDataId.dataset.id
    const checkedWhen = Date.now()

    const checkbox = new Checkbox(id, checkedWhen)

    checkboxManager.getCheckbox(id, result => {

        if(typeof result !== 'undefined') {
            checkboxManager.deleteCheckbox(id)
            return
        }

        try {
            checkboxManager.saveCheckbox(checkbox)
            console.log(`Saved checkbox with ID "${id}"`)
        } catch (error) {
            console.error(error)
        } finally {
            console.log('All processes was finished')
        }
    })
})

window.addEventListener('resize', () => {
    
    if(document.documentElement.clientWidth < 401) {
        document.querySelector('.information-content').classList.add('active')
        setTimeout(() => {
            document.querySelector('.information-content').classList.remove('active')
        }, 3500)
    } else {
        document.querySelector('.information-content').classList.remove('active')
    }
})

var isSwapping = false 
let coordY = 0
let prevScrollTop = 0

mainCheckboxes.addEventListener('mousedown', (event) => {
    
    
    if(!isSwapping) {

        document.documentElement.style.setProperty('user-select', 'none')
        event.preventDefault()
        isSwapping = true

        prevScrollTop = mainCheckboxes.scrollTop
        coordY = event.clientY

        return
    }
})

window.addEventListener('mousemove', (event) => {
    if(isSwapping) {
        mainCheckboxes.style.setProperty('pointer-events', 'none')
        mainCheckboxes.scrollTop = prevScrollTop - (event.clientY - coordY)
        return
    }
})

window.addEventListener('mouseup', () => {
    if(isSwapping) {
        
        isSwapping = false
        document.documentElement.style.removeProperty('user-select')
        mainCheckboxes.style.setProperty('pointer-events', 'all')
        return
    }
})

mainCheckboxes.addEventListener('scroll', () => {
    
    const scrollTop = mainCheckboxes.scrollTop || 0
    const clientHeight = mainCheckboxes.scrollHeight - mainCheckboxes.clientHeight
    const percentage = (scrollTop / clientHeight) * 100
    document.querySelector('.scrollbar-content').style.width = `${percentage}%`

})
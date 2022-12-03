import { Checkbox, CheckboxManager, CheckboxDataCache, CheckboxCreator } from './checkbox-manager.js'
import { randomID, createElement } from './utils.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')
const addCheckboxButton = document.querySelector('.add-checkbox')

const checkboxManager = new CheckboxManager()
const checkboxDataCache = new CheckboxDataCache()

function initializeMutationObserver() {
    
    const mutation = new MutationObserver(mutations => {
        // console.log(mutations)
    })

    mutation.observe(mainCheckboxes, {
        childList: true,
    })
}

window.addEventListener('DOMContentLoaded', () => {
    
    initializeMutationObserver()
    
    const s = createElement({
        script: {
            src: 'js/checkbox-manager.js',
            type: 'module'
        }
    })
    
    docBody.insertAdjacentElement('beforeend', s)

    checkboxDataCache.getAllCheckboxes(checkboxes => {
        checkboxes.forEach(checkbox => {
            
            const { id } = checkbox
            
            const label = document.createElement('label')
            label.setAttribute('class', 'checkbox-wrapper')
            label.setAttribute('data-id', String(id))

            
            const input = document.createElement('input')
            input.setAttribute('type', 'checkbox')
            
            const span = document.createElement('span')
            const txtContent = document.createTextNode(id)
            span.setAttribute('class', 'checkbox-span')
            
            span.appendChild(txtContent)
            label.append(input, span)

            mainCheckboxes.appendChild(label)

        })

        checkboxManager.getAllItems(items => {
            items.forEach(item => {
                document.querySelector(`[data-id="${item.id}"]`).querySelector('input').setAttribute('checked', 'true')
            })
        })
    })
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
        console.log('Use mouse swap feature...')
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
        mainCheckboxes.scrollTop = prevScrollTop - (event.clientY - coordY)
        return
    }
})

window.addEventListener('mouseup', () => {
    if(isSwapping) {
        
        isSwapping = false
        document.documentElement.style.removeProperty('user-select')

        return
    }
})

mainCheckboxes.addEventListener('scroll', () => {
    
    const scrollTop = mainCheckboxes.scrollTop || 0
    const clientHeight = mainCheckboxes.scrollHeight - mainCheckboxes.clientHeight
    const percetange = (scrollTop / clientHeight) * 100
    document.querySelector('.scrollbar-content').style.width = `${percetange}%`

})
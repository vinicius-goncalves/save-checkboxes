import { Checkbox, CheckboxManager, CheckboxDataCache } from './checkbox-manager.js'
import { randomID } from './utils.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')
const addCheckboxButton = document.querySelector('.add-checkbox')

const checkboxManager = new CheckboxManager()
const checkboxDataCache = new CheckboxDataCache()

window.addEventListener('DOMContentLoaded', () => {
    
    const script = document.createElement('script')
    script.setAttribute('src', 'js/checkbox-manager.js')
    script.setAttribute('type', 'module')
    docBody.insertAdjacentElement('beforeend', script)
    
    checkboxManager.getAllItems(items => {
        items.forEach(item => {
            document.querySelector('[data-id="'+item.id+'"]').querySelector('input').setAttribute('checked', 'true')
        })
    })
})

addCheckboxButton.addEventListener('click', () => {
    
    const newID = String(randomID(16))
    checkboxDataCache.findCheckbox(newID)

    // const label = document.createElement('label')
    // label.setAttribute('class', 'checkbox-wrapper')

    // const input = document.createElement('input')
    // input.setAttribute('type', 'checkbox')
    // input.setAttribute('data-id', newID)

    // const span = document.createElement('span')
    // const textNodeContent = document.createTextNode(newID)
    // span.appendChild(textNodeContent)

    // label.append(input, span)
    
    // mainCheckboxes.insertAdjacentElement('beforeend', label)

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

        if(typeof result !== 'undefined' && !targetClicked.checked) {
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

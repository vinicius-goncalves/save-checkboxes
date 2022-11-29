import { Checkbox, CheckboxManager, CheckboxDataCache, CheckboxCreator } from './checkbox-manager.js'
import { randomID } from './utils.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')
const addCheckboxButton = document.querySelector('.add-checkbox')

const checkboxManager = new CheckboxManager()
const checkboxDataCache = new CheckboxDataCache()

function initializeMutationObserver() {
    
    const mutation = new MutationObserver(mutations => {
        console.log(mutations)
    })

    mutation.observe(mainCheckboxes, {
        childList: true,
    })
}

window.addEventListener('DOMContentLoaded', () => {
    
    initializeMutationObserver()
    
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
    

    // <label class="checkbox-wrapper" data-id="1">
    //             <input type="checkbox">
    //             <span class="checkbox-span">Check me!</span>
    //         </label>

    const id = randomID(5)
    const checkbox = new CheckboxCreator(id)
    checkboxDataCache.putCheckbox(checkbox).then(result => {
        const { created, identify } = result
        if(created) {
            
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

        }
    })
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

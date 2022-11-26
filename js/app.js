import { Checkbox, CheckboxManager } from './checkbox-manager.js'

const docBody = document.body
const mainCheckboxes = document.querySelector('.main-checkboxes')

const checkboxManager = new CheckboxManager()

window.addEventListener('DOMContentLoaded', () => {
    
    const script = document.createElement('script')
    script.setAttribute('src', 'js/checkbox-manager.js')
    script.setAttribute('type', 'module')
    docBody.insertAdjacentElement('beforeend', script)

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
    console.log(checkbox)

})
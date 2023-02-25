// import { Checkbox, CheckboxManager } from './checkbox-manager.js'
// import { Elements } from './elements-cache.js'
// import { randomID, createElement } from './utils.js'

// const docBody = document.body
// const mainCheckboxes = document.querySelector('.main-checkboxes')
// const addCheckboxButton = document.querySelector('.add-checkbox')

// const checkboxManager = new CheckboxManager()
// const elements = new Elements()

// async function createCheckboxes(els) {

//     const checkboxes = await checkboxDataCache.getAllCheckboxes()

//     checkboxes.forEach(checkbox => {

//         const { id } = checkbox

//         const label = createElement(els.CHECKBOX_WRAPPER)
//         label.setAttribute('data-id', id)
        
//         const input = createElement(els.INPUT_CHECKBOX)

//         const span = createElement(els.SPAN_CHECKBOX)
//         const txtContent = document.createTextNode(id)
        
//         span.appendChild(txtContent)
//         label.append(input, span)

//         mainCheckboxes.appendChild(label)

//     })

//     async function loadCheckboxesChecked() {

//         const checkboxesChecked = await checkboxManager.getAllItems()
//         if(!Array.isArray(checkboxesChecked)) {
//             return
//         }

//         checkboxesChecked.forEach(item => {

//             const { id } = item
//             const itemWrapper = document.querySelector(`[data-id="${id}"]`)
//             const inputElement = itemWrapper.querySelector('input')

//             const checkedAttr = document.createAttribute('checked')
//             checkedAttr.value = 'true'

//             inputElement.setAttributeNode(checkedAttr)
//         })
//     } 

//     requestIdleCallback(() => {
//         loadCheckboxesChecked()
//     })
// }

// async function handleWithInitialElements() {

//     const els = await elements.getElementsIntoCache()

//     const script = createElement(els.CHECKBOX_MANAGER_FILE)
//     docBody.insertAdjacentElement('beforeend', script)

//     createCheckboxes(els)

// }

// window.addEventListener('DOMContentLoaded', () => {
//     handleWithInitialElements()
        
// })

// addCheckboxButton.addEventListener('click', async () => {

//     const id = randomID(5)
//     const checkbox = new CheckboxCreator(id)
//     const creationResult = await checkboxDataCache.putCheckbox(checkbox)
//     const { created, identify } = creationResult

//     if(!created) { return }

//     const label = document.createElement('label')
//     label.setAttribute('class', 'checkbox-wrapper')
//     label.setAttribute('data-id', String(identify))

//     const input = document.createElement('input')
//     input.setAttribute('type', 'checkbox')
    
//     const span = document.createElement('span')
//     span.setAttribute('class', 'checkbox-span')

//     const textNode = document.createTextNode(identify)
//     span.appendChild(textNode)

//     label.append(input, span)

//     mainCheckboxes.appendChild(label)

// })


// async function saveCheckboxClicked(event) {
//     const targetClicked = event.target
//     if(targetClicked.type !== 'checkbox') {
//         return
//     }

//     const closestDataId = targetClicked.closest('[data-id]')
//     const { id } = closestDataId.dataset
//     const checkedWhen = Date.now()

//     const checkbox = new Checkbox(id, checkedWhen)
//     const checkboxFound = await checkboxManager.getCheckbox(id)

//     if(typeof checkboxFound !== 'undefined') {
//         checkboxManager.deleteCheckbox(id)
//         return
//     }
    
//     try {
//         const checkboxAdded = await checkboxManager.saveCheckbox(checkbox)
//         console.log(`Saved checkbox with ID "${checkboxAdded.id}"`)
//     } catch (error) {
//         console.error(error)
//     } finally {
//         console.log('All processes was finished')
//     }
// }

// const initEvents = {
//     '[class="main-checkboxes"].click': [
//         saveCheckboxClicked.bind(this)
//     ]
// }

// Object.entries(initEvents).forEach(pair => {
    
//     const [ selector, event ] = pair[0].split('.')
//     const el = document.querySelector(selector)
//     el.addEventListener(event, pair[1][0])

// })

// window.addEventListener('resize', () => {
    
//     if(document.documentElement.clientWidth < 401) {
//         document.querySelector('.information-content').classList.add('active')
//         setTimeout(() => {
//             document.querySelector('.information-content').classList.remove('active')
//         }, 3500)
//     } else {
//         document.querySelector('.information-content').classList.remove('active')
//     }
// })

// var isSwapping = false 
// let coordY = 0
// let prevScrollTop = 0

// mainCheckboxes.addEventListener('mousedown', (event) => {
    
//     if(!isSwapping) {

//         document.documentElement.style.setProperty('user-select', 'none')
//         event.preventDefault()
//         isSwapping = true

//         prevScrollTop = mainCheckboxes.scrollTop
//         coordY = event.clientY
//         return
//     }
// })

// window.addEventListener('mousemove', (event) => {
//     if(isSwapping) {
//         mainCheckboxes.style.setProperty('pointer-events', 'none')
//         mainCheckboxes.scrollTop = prevScrollTop - (event.clientY - coordY)
//         return
//     }
// })

// window.addEventListener('mouseup', () => {
//     if(isSwapping) {
        
//         isSwapping = false
//         document.documentElement.style.removeProperty('user-select')
//         mainCheckboxes.style.setProperty('pointer-events', 'all')
//         return
//     }
// })

// mainCheckboxes.addEventListener('scroll', () => {
    
//     const scrollTop = mainCheckboxes.scrollTop || 0
//     const maxClientHeightScroll = (mainCheckboxes.scrollHeight - mainCheckboxes.clientHeight) || 0
//     const percentage = (scrollTop / maxClientHeightScroll) * 100

//     const scrollBarContent = document.querySelector('.scrollbar-content')
//     const scrollBarStyle = scrollBarContent?.style
//     scrollBarStyle.setProperty('width', `${percentage}%`)

// })
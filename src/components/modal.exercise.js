// 🐨 you're going to need the Dialog component
// It's just a light wrapper around ReachUI Dialog
// 📜 https://reacttraining.com/reach-ui/dialog/
/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'
import {Dialog, CircleButton} from './lib'
import VisuallyHidden from '@reach/visually-hidden'

// 💰 Here's a reminder of how your components will be used:
/*
<Modal>
  <ModalOpenButton>
    <button>Open Modal</button>
  </ModalOpenButton>
  <ModalContents aria-label="Modal label (for screen readers)">
    <ModalDismissButton>
      <button>Close Modal</button>
    </ModalDismissButton>
    <h3>Modal title</h3>
    <div>Some great contents of the modal</div>
  </ModalContents>
</Modal>
*/

// we need this set of compound components to be structurally flexible
// meaning we don't have control over the structure of the components. But
// we still want to have implicitly shared state, so...
// 🐨 create a ModalContext here with React.createContext
const ModalContext = React.createContext()

function useModal() {
  const context = React.useContext(ModalContext)

  if (context === undefined) {
    throw new Error(`useModal must be used inside the ModalContext`)
  }

  return context
}

// 🐨 create a Modal component that manages the isOpen state (via useState)
// and renders the ModalContext.Provider with the value which will pass the
// isOpen state and setIsOpen function

function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false)

  return <ModalContext.Provider value={{isOpen, setIsOpen}} {...props} />
}

// ...fns  ===>  fn1(), fn2() ...
// ...args ===>  arg1, arg2 ...
function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => fn?.(...args))
  }
}

// 🐨 create a ModalDismissButton component that accepts children which will be
// the button which we want to clone to set it's onClick prop to trigger the
// modal to close
// 📜 https://reactjs.org/docs/react-api.html#cloneelement
// 💰 to get the setIsOpen function you'll need, you'll have to useContext!
// 💰 keep in mind that the children prop will be a single child (the user's button)

function ModalDismissButton(props) {
  const {setIsOpen} = useModal()

  return React.cloneElement(props.children, {
    onClick: callAll(() => setIsOpen(false), props.children.props.onClick),
  })
}

// 🐨 create a ModalOpenButton component which is effectively the same thing as
// ModalDismissButton except the onClick sets isOpen to true

function ModalOpenButton({children: child}) {
  const {setIsOpen} = useModal()

  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  })
}

// 🐨 create a ModalContents component which renders the Dialog.
// Set the isOpen prop and the onDismiss prop should set isOpen to close
// 💰 be sure to forward along the rest of the props (especially children).

function ModalContentsBase(props) {
  const {isOpen, setIsOpen} = useModal()

  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

function ModalContents({title, children, ...props}) {
  return (
    <ModalContentsBase {...props}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
          <CircleButton>
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentsBase>
  )
}

// 🐨 don't forget to export all the components here

export {ModalContents, ModalOpenButton, ModalDismissButton, Modal}

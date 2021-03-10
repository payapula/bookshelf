// 🐨 you're gonna need this stuff:
import {Modal, ModalContents, ModalOpenButton} from '../modal'
import {Button} from '../lib'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import '@testing-library/jest-dom/extend-expect'

test('can be opened and closed', () => {
  const label = 'Model label'
  const title = 'Modal title'
  const content = 'Modal content'
  render(
    <Modal>
      <ModalOpenButton>
        <Button variant="primary">Open</Button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <div>{content}</div>
      </ModalContents>
    </Modal>,
  )

  const open = screen.getByRole('button', {name: /open/i})

  userEvent.click(open)

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label', label)
  const inModal = within(modal)
  expect(inModal.getByText(content)).toBeInTheDocument()

  const close = inModal.getByRole('button', {name: /close/i})

  userEvent.click(close)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
// 🐨 render the Modal, ModalOpenButton, and ModalContents
// 🐨 click the open button
// 🐨 verify the modal contains the modal contents, title, and label
// 🐨 click the close button
// 🐨 verify the modal is no longer rendered
// 💰 (use `query*` rather than `get*` or `find*` queries to verify it is not rendered)

import { createStore, createApi, createEvent } from 'effector'

export const $EditDialog = createStore({
  isOpen: false,
  resource: null,
})
export const ResourceEditorControl = createApi($EditDialog, {
  show: (state, resource) => ({ resource, isOpen: true}),
  hide: () => ({ isOpen: false }),
})

export const didClickOnHashTag = createEvent()

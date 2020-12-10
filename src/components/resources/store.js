import { createStore, createApi, createEvent } from 'effector'

export const $EditDialog = createStore({
  isOpen: false,
  resource: null,
  mode: null,
})
export const ResourceEditorControl = createApi($EditDialog, {
  show: (state, { mode, resource }) => ({ mode, resource, isOpen: true}),
  hide: () => ({ isOpen: false }),
})

export const didClickOnHashTag = createEvent()

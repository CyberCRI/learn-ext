import { createStore, createApi } from 'effector'

export const $EditDialog = createStore({
  isOpen: false,
  resource: null,
})
export const ResourceEditorControl = createApi($EditDialog, {
  show: (state, resource) => ({ resource, isOpen: true}),
  hide: () => ({ isOpen: false }),
})

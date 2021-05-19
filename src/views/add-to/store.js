import { createStore, createApi, createEvent } from 'effector'

export const $AddToDialog = createStore({
  isOpen: false,
  resource: null,
})
export const AddToDialogControl = createApi($AddToDialog, {
  show: (state, { resource }) => ({ resource, isOpen: true }),
  hide: () => ({ isOpen: false }),
})

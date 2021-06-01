import { createStore, createApi, createEvent } from 'effector'

export const $AddToDialog = createStore({
  isOpen: false,
  resource: null,
})
export const AddToDialogControl = createApi($AddToDialog, {
  show: (state, { resource }) => ({ resource, isOpen: true }),
  hide: () => ({ isOpen: false }),
})

export const $AddMultipleDialog = createStore({
  isOpen: false,
  urls: null,
})
export const AddMultipleDialogControl = createApi($AddMultipleDialog, {
  show: (state, { urls }) => ({ urls, isOpen: true }),
  hide: () => ({ isOpen: false }),
})

export const didClickSaveAll = createEvent()

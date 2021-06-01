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

export const $DetailsDialog = createStore({
  isOpen: false,
  resource: null,
})
export const ResourceDetailsDialogControl = createApi($DetailsDialog, {
  show: (state, { resource }) => ({ resource, isOpen: true }),
  hide: () => ({ isOpen: false }),
})

// This event is emitted whenever a resource object is edited in the EditResource
// component.
// Hook onto this to update resource state elsewhere.
export const didSaveEditedResource = createEvent()

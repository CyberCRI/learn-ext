import { createStore, createEvent } from 'effector'

export const setGlobalContext = createEvent()
export const $globalContext = createStore({
  authorized: false,
  urls: { login: '/api/auth/login' },
})

$globalContext.on(setGlobalContext, (state, context) => ({...state, ...context}))

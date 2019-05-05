import { context, Runtime } from '~mixins/utils'


class Store {
  constructor () {
    if (context() === Runtime.extension) {
      // Use extension localstorage.
    }
  }
}

# SearchUI Stylesheets

This module is forked off from `@elastic/search-ui`. Entire subtree of stylesheets
is here, so it might be that it will require updates along with the `package.json`
entry.

A specific dependency used by sui is `@react-component/pagination`, from which I
got the source that lives now at `./sui-sass/components/_rc-pagination.scss`.


**Commit Hashes** at the fork.
- `search-ui: 30ff212`
- `rc-pagination: f4bc7ee`

**Content**
- [`packages/react-search-ui-views/src/styles`][0]
- [`react-component/pagination/assets/index.less`][1] was transpiled to `scss` and later,
  cleaned up to remove some styles we don't need right now.


**Changes**
- Please diff the initial commit. Too many to list here.


### License

- @elastic/search-ui: Apache License v2.0 (as of 30ff212).
- @react-component/pagination: MIT (as of f4bc7ee)


[0]: https://github.com/elastic/search-ui/blob/master/packages/react-search-ui-views/src/styles/styles.scss
[1]: https://github.com/react-component/pagination

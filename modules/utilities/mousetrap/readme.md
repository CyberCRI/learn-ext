# Mousetrap

Obtained from [ccampbell/mousetrap][1].

This fork is to add some functionalities to mousetrap that are only relevant
for welearn project.

Specifically, this would add:

- A handler for "key-repeat" event, with an acceleration model.
- Method from `mousetrap/plugins` for adding `pause` and `unpause` bindings.
- Don't allow it to export a global object. Instead, export an es6 module.


## License

The original library license is reproduced below:

```
/**
 * Copyright 2012-2017 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.6.3
 * @url craig.is/killing/mice
 */
```

[1]: https://github.com/ccampbell/mousetrap/blob/master/mousetrap.js

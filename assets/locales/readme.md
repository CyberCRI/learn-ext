## Localisation

As always, `MDN` has excellent reference for localisation of strings.

For reference, the locale files are stored in `_locales/[en, fr, de, hi, etc]/messages.json`.
It looks like this:

```json
{
  "stringName": {
    "message": "Localised string content"
  },
  "anotherStringName": {
    "message": "Can even use substitutions like $such$.",
    "placeholders": {
      "such": {
        "content": "this!"
      }
    }
  }
}
```


### Locale pattern used for this extension

Instead of the usual structure, we're gonna use `yaml` files due to its
compact syntax, and easy nesting. The locale files are hence defined as
`<language-code>.yml`. With `webpack-copy-plugin` and `yaml`
transformation, these files are transpiled to `json` files at correct
location.

Additionally, this syntax also supports nesting so the string `name` can
kept in a more logical order.

```yaml
extension:
  name:
    message: 'iLearn Extension'
  description:
    message: 'Collaborative Learning with iLearn'

command:
  page-actions:
    toggle:
      message: 'Add the resource to your ilearn library'
```

The transformation function flattens this nested structure until it finds
the last level object that is, the object that contains `message` key. To
flatten the `name`, all the parent `keys` are prepended to it.

For example, the above file would transform to this `json`:

```json
{
  "extension.name": {
    "message": "iLearn Extension"
  },
  "extension.description": {
    "message": "Collaborative Learning with iLearn"
  },
  "command.page-actions.toggle": {
    "message": "Add the resource to your ilearn library"
  }
}
```


### Gotchas

To avoid unnecessary complexity, the transformation function is opinionated.
It only transforms the object if there's a `message` key in it. Rest of the contents
of the element are copied as is, hence all the advance keys such as `placeholder`
and `examples` are supported as long as they're in the same object.

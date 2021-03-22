# Architecture

The chrome and firefox extensions share all of the code except `manifest.json`.

By design, the extension has two parts: `background` and `content-script`.
The `background` script is always running. `content-script` is run whenever a user
clicks on the "Add to WeLearn" button.

Naturally we'd need some mechanism to communicate between the two scripts. Extension
APIs provide a messaging system that takes care of this communication. Further,
we have implemented a message bus in `src/procs/portal.js` which allows a callback
style messaging interface.

Using this `portal` bus for messaging we keep the UI in sync. This in effect means
that `background` script handles updating the state of "Add to WeLearn" icon based
on whether or not the `popover` in `content-script` is open.

The `content-script` is simply a script that loads `pages/popover` in an `iframe`
in context of the current page.

All the logic related to actually adding the page to `welearn` is isolated inside
`pages/popover`. Remaining are small bits to show/hide the popover.

We are not using the native extension's popover page because we need to keep the
state of the popover alive in context of the page it is shown on.

## Building Extension

As described earlier, we simply set the `target` to relevant browser name for the
script to work. Hence, to build chrome extension, run:

```
./panda release:build --chrome
```

The bundle will be in `.builds/chrome` directory. The build script takes care of
producing this directory in a format that's compatible for extensions.

## Releasing Extension

Chrome and firefox have different approaches of release. For chrome you need to use
the Chrome Web Store dashboard, while for Firefox you need your signing keys from
Addons Store.

Once you have built the extension and are ready to release, it's helpful to do some
sanity checks:

- Did you increment the version numbers in the `manifest.json`?
- Did you build with correct `UPSTREAM`, pointing to production URL? Check the .env file.
- Did you update changelogs in `src/pages/changelog/changelog.md`?

### Release chrome extension
Make a `zip` archive of `.builds/chrome` directory. Make sure that you zip the "chrome"
directory and not the top level directory.

Upload this zip file to Chrome Web Store dashboard and wait for the new version to be
approved.

That's it for chrome, once approved the new version will be rolled-out to the users
slowly.

### Release firefox extension
Set your Firefox Addons Store API keys in correct `.env` variables.

Build the extension taking care of the sanity checks mentioned earlier.

Then, run `./panda publish:firefox` which uses `web-ext` tool to lint, pack, and sign
the extension.

The built extension will live in `.builds/gecko-artifacts`. This directory should be
then `rsync`'d to the `opt.ilearn.cri-paris.org` server where a python server is normally
running to serve updates to existing users.


Hi 🖖

You're looking at the source code for WeLearn project which powers [WeLearn Browser Extension](https://ilearn.cri-paris.org).

## Components

Ideally it would be trivial to build and test this extension thanks to the build
scripts with our friendly `./panda` glue-scripts. Use `./panda help` for commands.

**Overview**

- `dev:build`: Build development version of extension. Helpful for debugging.
- `dev:server`: Run a dev server using `webpack-dev-server`
- `dev:watch`: Watch and compile as you change the source files.
- `dev:webext`: Start a `firefox` instance with the extension installed.
- `release`: Build production version, sign with mozilla extension signing service, and upload the artifacts.

```
WeLearn Ext Panda! (@,@)

Usage:
  panda <command> [--command-options] [<arguments>]
  panda -?
  panda --version

Options:
  -?  Display this help information.
  --version  Display version information.

Version: 0.1.1

Help:
  panda help [<command>]

Available commands:
  commands
  dev:build
  dev:server
  dev:storybook
  dev:watch
  dev:webext
  gen:webfonts
  help
  release
  release:build
  release:bump
  release:dev
  release:pack
  release:publish
  release:sign
  version
```

**Usage**

After cloning this repo:

- Copy sample `dotenv` file from `.env.sample` to `.env`. You may wish to change
  the variables depending on your requirements.
- Install JS packages using `yarn install`
- Run any of the script described above using `./panda`.

## Notes

- Extension uses `react`, you can find the components in `src` directory.
- Handlers for extension are in `src/procs` within same source file name
  as relevant `web-ext` `API` it uses (eg. runtime, background, etc.)

### Resources
- `MDN` has comprehensive resources for [`web-ext` development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)


`:wq`

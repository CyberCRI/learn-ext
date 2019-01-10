Hi 🖖

You're looking at the source code for iLearn project which powers [iLearn Browser Extension](https://ilearn.cri-paris.org).

## Components

Ideally it would be trivial to build and test this extension thanks to the build
scripts in `package.json`. The following list describes them:

- `build:dev`: Build development version of extension. Helpful for debugging.
- `build:prod`: Build production version for distribution and usage.
- `start:dev-server`: Run a dev server using `webpack-dev-server`
- `start:dev`: Watch and compile as you change the source files.
- `start:web-ext--run`: Start a `firefox` instance with the extension installed.
- `start:docz`: Start a `docz` dev server. Useful for developing components.

**Usage**

After cloning this repo:

- Copy sample `dotenv` file from `.env.sample` to `.env`. You may wish to change
  the variables depending on your requirements.
- Install JS packages using `yarn install`
- Run any of the script described above using `npm run [start:dev, etc]`.

## Notes

- Extension uses `react`, you can find the components in `src` directory.
- Handlers for extension are in `src/procs` within same source file name
  as relevant `web-ext` `API` it uses (eg. runtime, background, etc.)

### Resources
- `MDN` has comprehensive resources for [`web-ext` development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)


`:wq`

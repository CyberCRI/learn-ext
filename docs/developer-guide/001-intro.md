# Project Structure

The repository is organised as a bunch of independent modules.
At the top level we have `modules` and `src`.

Pages are compiled from templates located in `src/pages`.
Each subdirectory inside `src/pages` represents an html page that will be generated
using html-webpack-plugin. For full build matrix setup check out `webpack.config.js`.

Extension related scripts are in `src/procs`. Here the entry point is `background.js`.
Again, this is defined in `webpack.config.js`.

We have static assets in `assets` directory which contains icons, fonts, images, and
other static files. These are copied into final bundle as a build step.

The `assets/fonts` directory contains all the fonts we wish to use in css. A python script is
provided that scans this directory looking for all the fonts it can find and then it
generates a SCSS file in `src/styles/_fonts.scss`.

Another asset is locales. Locales are defined in a YAML file, which is transformed to
`i18n` format json file. Another python script is provided that does this transformation.
Check out `tools/combine-locales.py`.


# Installation
We're gonna need `python3`, `node`, `npm`, `yarn`, `fontconfig`. Install these for your
current operating system.

We recommend you also create a `python` virtual environment for this repo.

Then:

- Install yarn and javascript dependencies
```
yarn install
```

- Install python dependencies
```
pip3 install -r requirements.txt
```

- Create a copy of the `.env.sample` as `.env` and edit the relevant environment variables.

## Building your first bundle

Ensure that you have installed all the dependencies and have created a copy of `.env` with
your local environment variables substituted.

Then, run `./panda` to list all the commands you have available. `panda` is a helper script
written in `bash` where you can define commands used frequently in development cycle.

- Build a production bundle of the webapp:
  `./panda release:build --web`
- Build a bundle of chrome or firefox extension:
  `./panda release:build --chrome` or `./panda release:build --firefox`

The bundles will be stored in `.builds` directory in the root of this repository.

You can also run a development server which watches files for changes and rebuilds as necessary.
To do that, you need:

- `./panda dev:watch --web`

Substitute "target" to `--web`, `--firefox` or `--chrome` to switch which bundle is built.

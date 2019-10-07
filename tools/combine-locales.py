# -*- coding: utf-8 -*-
import click
import glob
import hues
import json
import os
import yaml
import datetime

from collections import namedtuple

BASE_PATH = 'assets/locales'
OUTPUT_PATH = 'modules/i18n/locales.json'

LocaleFile = namedtuple('LocaleFile', ['lang', 'file', 'body'])

def discover_locales(path: str):
  fnames = glob.glob(f'{path}/*.yml')

  for f in fnames:
    lang = os.path.splitext(os.path.basename(f))[0]
    with open(f, 'r') as fp:
      body = yaml.safe_load(fp)
    yield LocaleFile(lang, f, body)


@click.command()
@click.option('-p', '--path', default=BASE_PATH, help='Directory containing yaml locales')
@click.option('-o', '--output', default=OUTPUT_PATH, help='JSON output path')
def locales_combinator(path, output):
  '''Combines Locale Strings in yml files at `path` in a json blob at `output`'''
  locale_files = list(discover_locales(path))
  locales = {l.lang: l.body for l in locale_files}
  langs = [l.lang for l in locale_files]

  blob = {
    '_meta': {
      'langs': langs,
      'generated': datetime.datetime.utcnow().isoformat(),
    },
    **locales,
  }

  hues.info('-> Discovered locales in languages:', blob['_meta']['langs'])

  with open(output, 'w') as fp:
    json.dump(blob, fp, ensure_ascii=False, indent=2, sort_keys=True)
  hues.success('<~> Wrote locales as json to', output)


if __name__ == '__main__':
  locales_combinator()

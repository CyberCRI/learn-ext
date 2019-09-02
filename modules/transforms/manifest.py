# Uses information from git commit hash, build settings, to rewrite the
# manifest from the base template.
import yaml
import json
import os

from pydash import py_

# Obtain latest git revision for this version


def read_manifests():
  # Load the template located in the same directory as this script.
  here = os.path.dirname(__file__)
  template_path = os.path.abspath(f'{here}/manifest.tpl.yml')

  with open(template_path, 'r') as fp:
    manifests = yaml.load(fp)
  return manifests


def find_icon_assets():
  '''Populate target specific icons (and sizes) in manifest fields.'''
  pass


def dump_manifest(target):
  '''Dump JSON manifest for given target.'''
  pass

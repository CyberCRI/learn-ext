import io
import re
import hues
import os
import pandas as pd
import subprocess
import click

from pydash import py_


def process_fontlist(df, urlprefix):
  '''Use the dataframe to transform the fontlist so it's css compliant.'''
  def transform_weight(weight):
    # Fontconfig weights are a bit different than CSS weights we're used to.
    transformers = [
      (100, range(0, 55)),
      (200, range(55, 85)),
      (300, range(85, 105)),
      (500, range(105, 185)),
      (600, range(185, 205)),
      (800, range(205, 300)),
    ]
    for w, r in transformers:
      if weight in r:
        return w
    # By default, we'll assume it's 800
    return 800

  def transform_fontname(name):
    # In CSS, it's quite annoying to use various "Medium", "SemiBold", and
    # "Light" suffixes. Here we just remove them from names.
    pattern = r'^(.*) (Light|Medium|SemiBold)$'
    try:
      return re.match(pattern, name).group(1)
    except AttributeError:
      return name

  def transform_slant(slant):
    # Interpret font-style from the `slant` value.
    if slant > 0:
      return 'italic'
    return 'normal'

  def transform_url(path, version):
    # Since fontconfig only interprets the `woff` fonts, we'll just add `woff2`
    # as well.
    filename, _ = os.path.splitext(os.path.basename(path))
    return f'{urlprefix}/{filename}.{version}'

  df['fname'] = df.family.apply(transform_fontname)
  df['fweight'] = df.weight.apply(transform_weight)
  df['style'] = df.slant.apply(transform_slant)
  df['url'] = df.file.apply(lambda x: transform_url(path=x, version='woff2'))
  df['url_alt'] = df.file.apply(lambda x: transform_url(path=x, version='woff'))
  return df

def discover_fonts(path, urlprefix=''):
  '''Use font-config to scan and list the properties in a dataframe.'''
  header = ['family', 'postscriptname', 'weight', 'slant', 'width', 'file']
  fc_format = '|'.join([f'%{{{id}}}' for id in header])
  cmd = f'fc-scan {path} -b -f ">{fc_format}\\n"'

  return (py_(subprocess.getoutput(cmd))
    .lines()
    # Each font specific line begins with a `>`, filter them and get the actual
    # string in next call.
    .filter(lambda s: s[0] == '>')
    .map(lambda s: s[1:])
    .join('\n')
    # Pandas expect a string buffer in read_csv function.
    .thru(io.StringIO)
    .thru(lambda b: pd.read_csv(b, sep='|', names=header))
    .thru(lambda df: process_fontlist(df, urlprefix))
    .value()
  )

def generate_css(df):
  '''Use the dataframe to generate an entry for each font.'''
  def fontface_entry(row):
    '''Generate CSS for the font entry'''
    return f'''
    @font-face {{
      font-family: '{row.fname}';
      font-style: {row.style};
      font-weight: {row.fweight};
      src: local('{row.family}'), local('{row.postscriptname}'),
           url('{row.url}') format('woff2'),
           url('{row.url_alt}') format('woff');
    }}
    '''
  return ''.join(df.apply(fontface_entry, axis=1))


@click.command()
@click.option('-p', '--path', default='assets/fonts', help='Directory containing fonts')
@click.option('-u', '--urlprefix', default='../../assets/fonts', help='Public URL Prefix')
@click.option('-o', '--output', default='src/styles/fonts.css', help='CSS file output path')
def webfonts_generator(path, urlprefix, output):
  '''Discover and generate CSS file for the webfonts.'''
  fonts = discover_fonts(path, urlprefix)
  with open(output, 'w') as fp:
    fp.write(generate_css(fonts))

  hues.success(f'[!] Found {len(fonts)} fonts in {path}.')
  for name, els in fonts.groupby('fname').groups.items():
    hues.info(f'    -> {name} [{len(els)} style(s)]')

  hues.success(f'<~> CSS File written in {output}')


if __name__ == '__main__':
  webfonts_generator()

'''Find webfonts and generate corresponding css file ready to be imported.

Requires fontconfig to be installed.
'''
import io
import re
import hues
import os
import pandas as pd
import subprocess
import click

from pydash import py_


def process_fontlist(df, urlprefix, path):
  '''Use the dataframe to transform the fontlist so it's css compliant.'''
  def transform_fontname(name):
    # In CSS, it's quite annoying to use various "Medium", "SemiBold", and
    # "Light" suffixes. Here we just remove them from names.
    pattern = r'^(.*) (Light|Medium|SemiBold|ExtraBold|BlackItalic)$'
    try:
      return re.match(pattern, name).group(1)
    except AttributeError:
      return name

  def transform_url(version):
    # Since fontconfig only interprets the `woff` fonts, we'll just add `woff2`
    # as well.
    # Returns a function with version in closure.
    def transformer(font_path):
      # Get the relative path of the `font_path` from the parent `path`.
      relpath = os.path.relpath(font_path, path)
      # Remove the extension from the relative path and append with urlprefix.
      filepath, _ = os.path.splitext(relpath)
      return f'{urlprefix}/{filepath}.{version}'
    return transformer

  df['fname'] = df.family.apply(transform_fontname)

  # Fontconfig weights are a bit different than CSS weights we're used to.
  # Thankfully, we can use the weight in filename to get this.
  df['weight'] = (df.file
    .str
    .extract(r'(\d{3}).*\.woff')
    .fillna(400))

  # Interpret font-style from the filename pattern
  df['style'] = (df.file
    .str
    .extract(r'(regular|italic)\.woff')
    .fillna('regular')
    .replace('regular', 'normal'))

  df['url'] = df.file.apply(transform_url(version='woff2'))
  df['url_alt'] = df.file.apply(transform_url(version='woff'))
  return df

def discover_fonts(path, urlprefix='', picks=[]):
  '''Use font-config to scan and list the properties in a dataframe.

  In the scanned directory, font-config optionally accepts an output format
  string. We use this format for each font files found:
    >{family[0]}|{postscriptname}|{file}
  I added the `>` specifier to distinguish additional output (to stderr, but
  subprocess.getoutput captures both `stdout` and `stderr` together) from
  warnings.

  [NOTE]  05-09-2019
    Modified pattern to family[0], since the font family
    could include more than one names. We only want one.
  '''
  header = ['family', 'postscriptname', 'file']
  fc_format = '%{family[0]}|%{postscriptname}|%{file}'

  # Uses fc-scan utility from font-config.
  cmd = f'fc-scan {path} -b -f ">{fc_format}\\n"'

  df = (py_(subprocess.getoutput(cmd))
    .lines()
    .filter(lambda s: s[0] == '>')
    .map(lambda s: s[1:])
    .join('\n')
    .thru(io.StringIO)
    .thru(lambda b: pd.read_csv(b, sep='|', names=header))
    .thru(lambda df: process_fontlist(df, urlprefix, path))
    .value())

  if len(picks) > 0:
    hues.info('Picking:', picks)
    picked_fonts = [name.lower() for name in picks]
    frame_slice = (df
      .family
      .str
      .lower()
      .isin(picked_fonts))
    return df[frame_slice]
  return df


def generate_css(df):
  '''Use the dataframe to generate an entry for each font.'''

  def fontface_entry(row):
    '''Generate CSS for the font entry'''
    return f'''
    @font-face {{
      font-family: '{row.fname}';
      font-style: {row.style};
      font-weight: {row.weight};
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
@click.option('-t', '--take', multiple=True)
@click.option('--silent', is_flag=True, help='Disable logs')
def webfonts_generator(path, urlprefix, output, take, silent):
  '''Discover and generate CSS file for the webfonts.'''
  fonts = discover_fonts(path, urlprefix, take)
  with open(output, 'w') as fp:
    fp.write(generate_css(fonts))

  if not silent:
    hues.success(f'[!] Found {len(fonts)} matching fonts in {path}.')
    for name, els in fonts.groupby('fname').groups.items():
      hues.info(f'    -> {name} [{len(els)} style(s)]')

    hues.success(f'<~> CSS File written in {output}')


if __name__ == '__main__':
  webfonts_generator()

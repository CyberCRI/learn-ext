import requests
import re

from pydash import py_
from pyquery import PyQuery as pq
from sanic import Sanic
from sanic.response import json
from sanic.exceptions import InvalidUsage
from sanic_cors import cross_origin
from walrus import Walrus

from kekette import get_env


config = get_env(prefix='ILEARN_DEV_')
app = Sanic()

wdb = Walrus()
cache = wdb.cache()

parse_number = lambda x: float(re.findall(r'[\d\.]+', x)[0])

@cache.cached(timeout=1200)
def fetch_data(endpoint, **params):
  remote_url = f'http://{config.x_server}/{endpoint}'
  headers = {'Host': config.x_server}

  return requests.get(remote_url, params=params, headers=headers)


def proxy_keywords(url):
  r = fetch_data('extract_keywords', jsdata=url)

  dom = pq(r.content)

  kws = dom.find('li')
  labels = [x.text() for x in kws.find('strong').items()]

  kws.remove('strong')
  weights = [parse_number(x.text()) for x in kws.items()]

  return (py_(zip(labels, weights))
    .map(lambda x: {'label': x[0], 'weight': x[1]})
    .value())


def proxy_concepts(url):
  r = fetch_data('extract_concepts', jsdata=url)

  dom = pq(r.content)

  divs = dom.find('#concepts').find('div')

  hrefs = [i.attr('href') for i in divs.find('a').items()]
  labels = [i.attr('value') for i in divs.find('input').items()]

  divs.remove('input')
  divs.remove('label')

  weights = [parse_number(i.text()) for i in divs.items()]

  return (py_(zip(hrefs, labels, weights))
    .map(lambda x: {'href': x[0], 'label': x[1], 'weight': x[2]})
    .value())


@app.route('/concepts', methods=['GET', 'OPTIONS'])
@cross_origin(app)
def get_concepts(r):
  try:
    url = r.args['url'][0]

    return json({'keywords': proxy_keywords(url), 'concepts': proxy_concepts(url)})
  except KeyError:
    raise InvalidUsage('Insufficient arguments')


if __name__ == '__main__':
  app.run(host=config.host, port=config.port, debug=config.debug)

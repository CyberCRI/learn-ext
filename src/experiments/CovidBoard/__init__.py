import os
import pydantic
import json

from typing import List
from fastapi import APIRouter, Depends
from starlette.responses import RedirectResponse
from starlette.templating import Jinja2Templates
from starlette.requests import Request
from fastapi.encoders import jsonable_encoder
from loguru import logger

from api.core import bolt, env
from api.neoqueries import resourceops
from api.types.resources import Resource
from api.routers.utils import Bearer  # [!fixme]

from .types import ConceptCoords
from .graph import map_base_coords, covid_coords

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__))
ARTIFACT_DIR = env.static_files_dir
MAGIC_USER_ID = '8705149e0d3a449e9a70747df29ccea4'

router = APIRouter()
templates = Jinja2Templates(directory=TEMPLATE_DIR)

def _render_json(_type, var):
    return json.dumps(
        jsonable_encoder(pydantic.parse_obj_as(_type, var)),
        ensure_ascii=False)

def _render_chunk_url(chunk_name, chunk_type='js'):
    '''Take a chunk_name, and render url for the immutable builds.

    This uses assets plugin to emit a json list of chunks and the generated
    filename after webpack has built the source bundles.

    Asset file list is generated in <build directory>/webpack-assets.json.
    It is structured as:
        {
            <chunk_name>: { js: <url>, css: <url> }
        }

    We add this template tag which will resolve {{ chunk }} to the correct file.

    It is possible to specify `chunk_type` to whatever value required.
    '''
    with open(f'{ARTIFACT_DIR}/webpack-assets.json') as fp:
        artifacts = json.load(fp)

    return artifacts[chunk_name][chunk_type]


@router.get('/')
async def curation_covid(r: Request):
    rlist = bolt.read_tx(resourceops.get_user_resources,
        user_id=MAGIC_USER_ID,
        skip=0, limit=500)
    cmap = covid_coords()
    basemap = map_base_coords()

    context = {
        'request': r,
        'c_resources': _render_json(List[Resource], rlist),
        'covid_map': _render_json(List[ConceptCoords], cmap),
        'atlas_base': _render_json(List[ConceptCoords], basemap),
    }

    return templates.TemplateResponse('template.html', context)

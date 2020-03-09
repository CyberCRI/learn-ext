import ftfy

from pydantic import BaseModel, validator
from typing import Optional

class ConceptCoords(BaseModel):
    wikidata_id: str = None
    title_en: Optional[str] = None
    title_fr: Optional[str] = None

    x_map_en: Optional[float] = None
    y_map_en: Optional[float] = None
    x_map_fr: Optional[float] = None
    y_map_fr: Optional[float] = None
    elevation: Optional[float] = None

    @validator('title_en', 'title_fr')
    def ensure_titles(cls, v):
        if v is not None:
            return ftfy.fix_text(v.replace('_', ' ').replace('\\', ''))

    @validator('elevation')
    def hack_elevation(cls, v):
        if v is not None:
            return v

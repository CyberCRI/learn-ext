from api.core import bolt

from .types import ConceptCoords

def covid_coords():
    queryfn = lambda tx: tx.run('''
    MATCH (:Learner {uid: "8705149e0d3a449e9a70747df29ccea4"})-[:TAGGED]-(r:Resource)-[:IS_ABOUT]-(c:Concept)
    RETURN
        c.wikidata_id as wikidata_id,
        count(r) as elevation,
        c.title_en as title_en,
        c.title_fr as title_fr,
        c.x_map_en as x_map_en,
        c.y_map_en as y_map_en,
        c.x_map_fr as x_map_fr,
        c.y_map_fr as y_map_fr
    ORDER BY elevation DESC
    ''')

    return bolt.read_tx(queryfn).data()

def map_base_coords():
    queryfn = lambda tx: tx.run('''
    MATCH (:Learner)-[:TAGGED]-(r:Resource)-[:IS_ABOUT]-(c:Concept)
    RETURN
        c.wikidata_id as wikidata_id,
        count(r) as elevation,
        c.title_en as title_en,
        c.title_fr as title_fr,
        c.x_map_en as x_map_en,
        c.y_map_en as y_map_en,
        c.x_map_fr as x_map_fr,
        c.y_map_fr as y_map_fr
    ORDER BY elevation DESC
    ''')

    return bolt.read_tx(queryfn).data()

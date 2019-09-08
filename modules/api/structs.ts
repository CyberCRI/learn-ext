interface TrueSkill {
  trueskill_mu: number;
  trueskill_sigma: number;
}

interface Concept extends TrueSkill {
  lang: string;
  reliability_score: number;
  title: string;

  similarity_score?: number;
  wikidata_id?: string;
}

interface Keyword {
  label: string;
  weight: number;
}

interface Resource {
  url: string;
}

interface Group {
  group_id: string;
}

interface User {
  email: string;

}

interface IsAbout extends Concept {
  readability_score?: number;
}

interface Knows extends TrueSkill {
  wikidata_id: string;
}


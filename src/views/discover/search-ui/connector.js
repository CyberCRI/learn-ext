import _ from 'lodash'

import { CarteSearchAPI } from '@ilearn/modules/api'

const AvailableFacets = {
  marker:   { type: 'any' },
  user:     { type: 'any' },
  n_items:  { type: 'range' },
  n_users:  { type: 'range' },
  n_tags:   { type: 'range' },
  portal:   { type: 'any', filterable: true },
  academic_discipline: { type: 'any', filterable: true },
}

const DefaultFacetValues = {
  portal: [
    {
      field: 'portal',
      type: 'value',
      data: [
        { value: 'science', count: 123 },
        { value: 'math', count: 34 },
        { value: 'bio', count: 40 },
      ],
    },
  ],
  academic_discipline: [
    {
      field: 'academic_discipline',
      type: 'value',
      data: [
        { value: 'CS', count: 45 },
        { value: 'BioTech', count: 100 },
        { value: 'SysBio', count: 50 },
      ],
    },
  ],
  user: [
    {
      field: 'user',
      type: 'value',
      data: [
        { label: 'My Resources', value: 'prashant.sinha@cri-paris.org', count: 2 },
        { label: 'Demo', value: 'prashant@noop.pw', count: 42 },
        { label: 'CRI Projects',
          value: 'projects@import.bot',
          count: 421,
        },
        {
          label: 'The Conversation',
          value: 'theconversation@import.bot',
          count: 1234,
        },
      ],
    },
  ],
}

async function didSearch({ searchTerm, ...args }) {
  if (!searchTerm.length) {
    return {}
  }
  const limit = args.resultsPerPage
  const skip = args.resultsPerPage * (args.current - 1)

  const filters = _(args.filters).keyBy('field')
  const r = await CarteSearchAPI.wikiq({
    q: searchTerm,
    page: { skip, limit },
    source: filters.get('source.values.0'),
    user: filters.get('user.values.0', ''),
  })
  const results = r.results.map((n) => {
    return { ...n, id: { raw: n.resource_id } }
  })
  return {
    results,
    totalResults: r.pagination.count,
    totalPages: ~~(r.pagination.count / r.pagination.limit),
    facets: { ...DefaultFacetValues },
  }
}

async function didAutoComplete({ searchTerm }) {
  const items = await CarteSearchAPI.typeahead({ q: searchTerm })
  const suggestions = items.results

  return {
    autocompletedResults: suggestions,
  }
}

export function didTouchAutocompleteItem(item, context) {
  console.info(item, context)
  context.setFilter('source', item.source)
  context.setSearchTerm(item.wikidata_id, { shouldClearFilters: false })
}

export const searchConfig = {
  onSearch: didSearch,
  onAutocomplete: didAutoComplete,
  onAutocompleteResultClick: didTouchAutocompleteItem,
  searchQuery: {
    facets: AvailableFacets,
    alwaysSearchOnInitialLoad: true,
  },
  initialState: {
    searchTerm: '',
    resultsPerPage: 10,
  },
  hasA11yNotifications: false,
  debug: env.is_dev,
}

import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

import {
  WithSearch, SearchProvider, ErrorBoundary,
  SearchBox, Facet, ResultsPerPage, Sorting, Paging, PagingInfo,
} from '@elastic/react-search-ui'
import {
  MultiCheckboxFacet, SingleSelectFacet, SingleLinksFacet, BooleanFacet,
} from '@elastic/react-search-ui-views'

import { ResourceGrid } from '~components/resources'
import { CarteSearchAPI } from '@ilearn/modules/api'
import { viewportEvent } from './store'

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
      ]
    }
  ],
  academic_discipline: [
    {
      field: 'academic_discipline',
      type: 'value',
      data: [
        { value: 'CS', count: 45 },
        { value: 'BioTech', count: 100 },
        { value: 'SysBio', count: 50 },
      ]
    }
  ],
  user: [
    {
      field: 'user',
      type: 'value',
      data: [
        { label: 'My Resources', value: 'prashant.sinha@cri-paris.org', count: 2 },
        { label: 'noop', value: 'prashant@noop.pw', count: 42 },
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
    }
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

function didTouchAutocompleteItem(item, context) {
  console.info(item, context)
  context.setFilter('source', item.source)
  context.setSearchTerm(item.wikidata_id, { shouldClearFilters: false })
}

const searchConfig = {
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

const AutocompleteContainer = styled.div`
  position: absolute;
  padding: 5px 10px;
  max-height: 300px;
  overflow: auto;

  left: 0;
  right: 0;
  top: 100%;

  z-index: 400;

  background: #fff;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 0 2px rgba(0, 0, 0, .3);
`
const AutocompleteItemDiv = styled.div`
  margin: 0 0 2px 0;
  border-radius: 4px;

  &[aria-selected="true"] {
    background: #a1d2f7;
  }
`


const TagDiv = styled.div`
  cursor: pointer;
  padding: 5px 10px;

  p {
    margin: 0;
  }
`

const ConceptTagItem = ({ itemProps, nodeData }) => {
  const repr = nodeData.representations.find(node => node.lang === 'en')
  const isHighlighted = itemProps['aria-selected']
  React.useEffect(() => {
    if (isHighlighted) {
      viewportEvent.focusNode(repr)
    }
  })

  return <AutocompleteItemDiv {...itemProps}>
    <TagDiv>
      <p>{repr.title}</p>
    </TagDiv>
  </AutocompleteItemDiv>
}

const AutocompleteResults = ({ autocompletedResults, getItemProps, ...props }) => {
  const items = autocompletedResults.map(r => ({
    key: r.wikidata_id,
    nodeData: r,
    itemProps: getItemProps({ item: r, key: r.wikidata_id }),
  }))
  return (
    <AutocompleteContainer>
      <div>
        {items.map(props => <ConceptTagItem {...props}/>)}
      </div>
    </AutocompleteContainer>
  )
}

const PlaceHolder = (props) => {
  return (
    <div className='empty'>
      <h2>Browse resources on map</h2>
      <p>Pick a region (or several) by clicking on the map. You can refine your
      selection by zooming in, and select several regions by holding <kbd>shift</kbd>
      while clicking.</p>
    </div>
  )
}

const ResultView = ({ results, wasSearched }) => {
  if (results && results.length) {
    return <ResourceGrid resources={results}/>
  }

  if (!wasSearched) {
    return <PlaceHolder/>
  }

  return <p>No Matches</p>
}


const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  const onTouchAutocompleteItem = item => didTouchAutocompleteItem(item, props)
  React.useEffect(() => {
    return viewportEvent.click.watch(event => {
      const { source, data } = event
      onTouchAutocompleteItem({ source, ...data })
    })
  })
  return (
    <div className='search-root'>
      <ErrorBoundary>
        <div className='tools overlay'>
          <SearchBox
            autocompleteResults={true}
            autocompleteView={AutocompleteResults}
            onSelectAutocomplete={onTouchAutocompleteItem}/>
          <div className='tools'>
            <div>
              <Facet field='portal' label='Portals' view={MultiCheckboxFacet} />
              <Facet field='user' label='Map' view={SingleLinksFacet} />
              <Facet field='n_users' label='in nUsers Library' view={SingleLinksFacet} />
              <Facet field='n_tags' label='Has n-tags' view={SingleLinksFacet} />
              <Facet field='academic_discipline' label='academic_discipline' view={MultiCheckboxFacet} />
              <ResultsPerPage options={[10, 20, 30]} />
            </div>
          </div>
        </div>
        <div className='results'>
          <div className='items'>
            <div className='search-info'>
              <div className='state'>
                {isLoading && <span>Searching... </span>}
                {wasSearched && <PagingInfo />}
              </div>
            </div>
            <ResultView results={props.results} wasSearched={wasSearched} loading={isLoading}/>
            {wasSearched && <Paging />}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}

export const SearchView = (props) => {
  return (
    <SearchProvider config={searchConfig}>
      <WithSearch mapContextToProps={ctx => ctx}>
        {(props) => <SearchComposition {...props}/>}
      </WithSearch>
    </SearchProvider>
  )
}

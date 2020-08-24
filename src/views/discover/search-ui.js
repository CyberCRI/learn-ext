import React from 'react'
import {
  SearchProvider, SearchBox,
  PagingInfo, WithSearch, ErrorBoundary, Facet, ResultsPerPage,
  Sorting, Paging,
} from '@elastic/react-search-ui'
import {
  MultiCheckboxFacet, SingleSelectFacet,
  SingleLinksFacet, BooleanFacet,
} from '@elastic/react-search-ui-views'
import styled from 'styled-components'
import _ from 'lodash'

import '@elastic/react-search-ui-views/lib/styles/styles.css'

import { ControlGroup, InputGroup, Button, Portal } from '@blueprintjs/core'
import { ResourceGrid, Pagination } from '~components/resources'
import { CarteSearchAPI } from '@ilearn/modules/api'
import { viewportEvent, didPickLayer } from './store'


const searchConfig = {
  onSearch: async ({ searchTerm, ...args }) => {
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
      totalPages: ~~(r.pagination.count / r.pagination.limit) + 1,
      facets: {
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
              { value: 'My Resources', count: 152 },
              { value: 'Everything', count: 9405 },
              { value: 'CRI Projects', count: 1234 },
            ],
          }
        ],
        n_items: [
          {
            field: 'n_items',
            type: 'range',
            data: [
              { value: { to: 0, from: 10, name: '0-10' }, count: 50 },
              { value: { to: 10, from: 100, name: '10-100' }, count: 10 },
            ],
          },
        ],
        n_users: [
          {
            field: 'n_users',
            type: 'range',
            data: [
              { value: { to: 0, from: 10, name: '0-10' }, count: 50 },
              { value: { to: 10, from: 100, name: '10-100' }, count: 10 },
            ],
          },
        ],
        n_tags: [
          {
            field: 'n_tags',
            type: 'range',
            data: [
              { value: { to: 0, from: 10, name: '0-10' }, count: 50 },
              { value: { to: 10, from: 100, name: '10-100' }, count: 10 },
            ],
          },
        ],
      },
    }
  },
  onAutocomplete: async ({ searchTerm }) => {
    const items = await CarteSearchAPI.typeahead({ q: searchTerm })
    const suggestions = items.results

    return {
      autocompletedResults: suggestions,
    }
  },
  searchQuery: {
    facets: {
      portal: { type: 'any' },
      marker: { type: 'any' },
      user:   { type: 'any' },
      academic_discipline: { type: 'any', filterable: true },
      n_items: { type: 'range' },
      n_users:  { type: 'range' },
      n_tags:   { type: 'range' },
    },
    alwaysSearchOnInitialLoad: false,
  },
  initialState: {
    searchTerm: '',
    resultsPerPage: 20,
  },

  onAutocompleteResultClick: async (args) => console.log(args),
  hasA11yNotifications: false,
  debug: env.is_dev,
}

/// Note that this mount point is a simple div element in base html heirarchy.
/// It may be nicer to move it some other way, but I have other priorities atm.
const SearchInputMountPoint = 'search-input'

const SearchInputContainer = styled.div`
  position: relative;
  display: inline-block;

  z-index: 11;
`
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

const SearchInput = ({ getAutocomplete, getInputProps, getButtonProps, ...args }) => {
  const containerel = document.getElementById(SearchInputMountPoint)
  return <>
    <SearchInputContainer>
      <ControlGroup>
        <InputGroup {...getInputProps()} leftIcon='search' placeholder='Find Concepts'/>
        <Button {...getButtonProps()} icon='arrow-right' loading={args.isLoading}/>
      </ControlGroup>
      {getAutocomplete()}
    </SearchInputContainer>
  </>
}


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
    return <ResourceGrid resources={results} onDelete={console.log}/>
  }

  if (!wasSearched) {
    return <PlaceHolder/>
  }

  return <p>No Matches</p>
}


const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  React.useEffect(() => {
    return viewportEvent.click.watch((args) => {
      // Subscribe to coming in from map events.
      props.setFilter('source', args.source)
      props.setSearchTerm(args.data.wikidata_id, { shouldClearFilters: false })
    })
  })
  React.useEffect(() => {
    return didPickLayer.watch((args) => {
      if (args.user) {
        props.setFilter('user', args.src)
      } else {
        props.removeFilter('user')
      }
    })
  })
  return (
    <div className='search-root'>
      <ErrorBoundary>
        <div className='top'>
          <SearchBox
            autocompleteResults={true}
            autocompleteView={AutocompleteResults}
            onSelectAutocomplete={(item) => {
              props.setFilter('source', 'marker')
              props.setSearchTerm(item.wikidata_id, { shouldClearFilters: false })
            }}
            inputView={SearchInput}/>
        </div>
        <div className='results'>
          <div className='tools'>
            <div>
              <Sorting
                label={"Sort by"}
                sortOptions={[
                  {
                    name: "Relevance",
                    value: "",
                    direction: ""
                  },
                  {
                    name: "Recently Added",
                    value: "new",
                    direction: "dsc"
                  }
                ]}
              />
              <ResultsPerPage options={[10, 20, 30]} />
            </div>
            <div>
              <Facet field='portal' label='Portals' view={MultiCheckboxFacet} />
              <Facet field='user' label='Map' view={SingleSelectFacet} />
              <Facet field='n_users' label='in nUsers Library' view={SingleLinksFacet} />
              <Facet field='n_tags' label='Has n-tags' view={SingleLinksFacet} />
              <Facet field='academic_discipline' label='academic_discipline' view={MultiCheckboxFacet} />
            </div>
          </div>
          <div className='items'>
            <div className='info-bar'>
              {isLoading && <span>Searching... </span>}
              {wasSearched && <PagingInfo />}
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

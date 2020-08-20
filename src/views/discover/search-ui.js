import React from 'react'
import {
  SearchProvider, SearchBox,
  PagingInfo, WithSearch, ErrorBoundary, Facet,
} from '@elastic/react-search-ui'
import { MultiCheckboxFacet } from "@elastic/react-search-ui-views"
import styled from 'styled-components'
import _ from 'lodash'

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
      portal: { type: 'any', size: 2 },
      marker: { type: 'any', size: 2 },
      user: { type: 'any', size: 2 },
    },
    alwaysSearchOnInitialLoad: false,
  },
  initialState: {
    searchTerm: '',
    facets: {
      portal: [
        {
          field: 'portal',
          type: 'value',
          data: [
            { value: 'boop', count: 10 }
          ]
        }
      ],
      layer_source: [
        {
          field: 'layer_source',
          type: 'value',
          data: [
            { value: 'mine', count: 1 },
            { value: 'all', count: 1 },
            { value: 'group', count: 1 },
          ],
        }
      ],
    },
  },

  onAutocompleteResultClick: async (args) => console.log(args),
  debug: true,
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
  return <Portal container={containerel} className='search-portal'>
    <SearchInputContainer>
      <ControlGroup>
        <InputGroup {...getInputProps()} leftIcon='search' placeholder='Find Concepts'/>
        <Button {...getButtonProps()} icon='arrow-right' loading={args.isLoading}/>
      </ControlGroup>
      {getAutocomplete()}
    </SearchInputContainer>
  </Portal>
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
    return <ResourceGrid resources={results} />
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
          {false &&
            <SearchBox
              autocompleteResults={true}
              autocompleteView={AutocompleteResults}
              onSelectAutocomplete={(item) => {
                props.setFilter('source', 'marker')
                props.setSearchTerm(item.wikidata_id, { shouldClearFilters: false })
              }}
              inputView={SearchInput}/>
          }
          <>
            {isLoading && <p>Searching...</p>}
            {wasSearched && !isLoading && <PagingInfo />}
          </>
        </div>
        {false &&
          <div>
            <Facet field='portal' label='Portals' view={MultiCheckboxFacet}/>
            <Facet field='layer_source' label='Map' view={MultiCheckboxFacet}/>
          </div>}
        <div className='results'>
          <ResultView results={props.results} wasSearched={wasSearched} loading={isLoading}/>
        </div>
        <div className='bottom'>
          <Pagination cursor={props.current} count={props.totalPages} onPaginate={props.setCurrent}/>
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

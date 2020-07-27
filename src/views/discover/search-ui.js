import React from 'react'
import {
  SearchProvider, SearchBox,
  PagingInfo, WithSearch, ErrorBoundary,
} from '@elastic/react-search-ui'
import styled from 'styled-components'

import { ControlGroup, InputGroup, Button } from '@blueprintjs/core'
import { ResourceGrid, Pagination } from '~components/resources'
import { CarteSearchAPI } from '@ilearn/modules/api'
import { viewportEvent } from './store'


const searchConfig = {
  onSearch: async ({ searchTerm, ...args }) => {
    const limit = args.resultsPerPage
    const skip = args.resultsPerPage * (args.current - 1)
    const r = await CarteSearchAPI.search({ q: searchTerm, skip, limit })
    const results = r.results.map((n) => {
      return { ...n, id: { raw: n.resource_id } }
    })
    return {
      results,
      totalResults: r.pagination.count,
      totalPages: r.pagination.count / r.pagination.limit,
    }
  },
  onAutocomplete: async ({ searchTerm }) => {
    const items = await CarteSearchAPI.typeahead({ q: searchTerm })
    const suggestions = items.results

    return {
      autocompletedResults: suggestions,
    }
  },

  onAutocompleteResultClick: async (args) => console.log(args),
  debug: false,
}

const SearchInputContainer = styled.div`
  position: relative;
  display: inline-block;
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
const AutocompleteItem = styled.div`
  margin: 0 0 2px 0;
  border-radius: 4px;

  &[aria-selected="true"] {
    background: #a1d2f7;
  }
`

const SearchInput = ({ getAutocomplete, getInputProps, getButtonProps, ...args }) => {
  return <SearchInputContainer>
    <ControlGroup>
      <InputGroup {...getInputProps()} leftIcon='search'/>
      <Button {...getButtonProps()} icon='arrow-right' loading={args.isLoading}/>
    </ControlGroup>
    {getAutocomplete()}
  </SearchInputContainer>
}


const TagDiv = styled.div`
  cursor: pointer;
  padding: 5px 10px;

  p {
    margin: 0;
  }
`

const ConceptTagItem = ({ representations, wikidata_id, ...props }) => {
  const repr = representations.find(node => node.lang === 'en')

  return <TagDiv><p>{repr.title}</p></TagDiv>
}

const AutocompleteResults = ({ autocompletedResults, getItemProps, ...props }) => {
  return (
    <AutocompleteContainer>
      <div>
        {autocompletedResults.map((result) => (
          <AutocompleteItem {...getItemProps({ item: result, key: result.wikidata_id })}>
            <ConceptTagItem {...result} />
          </AutocompleteItem>
        ))}
      </div>
    </AutocompleteContainer>
  )
}

const ResultView = ({ results, wasSearched }) => {
  if (results && results.length) {
    return <ResourceGrid resources={results} />
  }

  if (!wasSearched) {
    return <p>Search for resources or use the map to pick concepts.</p>
  }

  return <p>No Matches</p>
}


const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  React.useEffect(() => {
    return viewportEvent.click.watch((args) => {
      // Subscribe to coming in from map events.
      console.log(args)
      props.setSearchTerm(args.data.title)
    })
  })
  return (
    <div className='search-root'>
      <ErrorBoundary>
        <div className='top'>
          <SearchBox
            autocompleteResults={true}
            autocompleteView={AutocompleteResults}
            onSelectAutocomplete={(item) => props.setSearchTerm(item.representations.find(node => node.lang === 'en').title)}
            inputView={SearchInput}/>
          <>
            {isLoading && <p>Searching...</p>}
            {wasSearched && !isLoading && <PagingInfo />}
          </>
        </div>
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

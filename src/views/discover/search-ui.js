import React from 'react'
import {
  SearchProvider, SearchBox,
  PagingInfo, Paging, WithSearch, ErrorBoundary,
} from '@elastic/react-search-ui'

import { ControlGroup, InputGroup, Button } from '@blueprintjs/core'
import { ResourceGrid, Pagination } from '~components/resources'
import { ConceptTag } from '~components/concepts'
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
      facets: {
        concepts: [
          {
            field: 'concepts',
            type: 'value',
            data: [
              { value: 'yoo', count: 20 },
              { value: 'yolo', count: 10 },
            ],
          },
        ],
      }
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

const SearchInput = ({ getAutocomplete, getInputProps, getButtonProps, ...args }) => {
  console.log(args.isOpen)
  return <>
    <ControlGroup>
      <InputGroup {...getInputProps()} leftIcon='search'/>
      <Button {...getButtonProps()} icon='arrow-right' loading={args.isLoading}/>
    </ControlGroup>
    {getAutocomplete()}
  </>
}

const AutocompleteResults = ({ autocompletedResults, getItemProps, ...props }) => {
  return (
    <div className="sui-search-box__autocomplete-container">
      {autocompletedResults.map((result, i) => (
        <div key={result.wikidata_id} onClick={(e) => {
          props.setSearchTerm(result.wikidata_id)
        }}>
          <ConceptTag {...result}/>
        </div>
      ))}
    </div>
  )
}

const ResultView = (props) => {
  if (props.results) {
    return <ResourceGrid resources={props.results} />
  }
  return <p>no results yet...</p>
}


const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  React.useEffect(() => {
    return viewportEvent.click.watch((args) => { props.setSearchTerm(args.data.title) })
  })
  return (
    <div className='search-root'>
      <ErrorBoundary>
        <SearchBox
          autocompleteResults={true}
          autocompleteView={AutocompleteResults}
          inputView={SearchInput}/>
        <>
          {isLoading && <p>I am loading now. okay?</p>}
          {wasSearched && !isLoading && <PagingInfo />}
        </>
        <ResultView results={props.results}/>
        <Pagination cursor={props.current} count={props.totalPages} onPaginate={props.setCurrent}/>
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

import React from 'react'
import {
  SearchProvider, SearchBox,
  Results, ResultsPerPage,
  PagingInfo, Paging,
  Sorting, Facet,
  WithSearch,
  ErrorBoundary,
} from '@elastic/react-search-ui'
import { Layout } from '@elastic/react-search-ui-views'

import '@elastic/react-search-ui-views/lib/styles/styles.css'

import { getTagRepresentation } from '~components/concepts/concepts'
import { CarteSearchAPI } from '@ilearn/modules/api'


const searchConfig = {
  onSearch: async ({ searchTerm, ...args }) => {
    const limit = args.resultsPerPage
    const skip = args.resultsPerPage * (args.current - 1)
    const r = await CarteSearchAPI.search({ q: searchTerm, skip, limit })
    const results = r.results.map((n) => {
      return {
        ...n,
        id: { raw: n.resource_id },
        title: { raw: n.title },
      }
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
    const suggestions = items.results.map((n) => {
      const { title, lang } = getTagRepresentation(n)
      return {
        id: { raw: n.wikidata_id },
        title: { raw: title },
        ...n,
      }
    })

    return {
      autocompletedResults: suggestions,
    }
  },

  onAutocompleteResultClick: async (args) => console.log(args),
  debug: true,
}

// sideContent = {
//             < div >
//   <Sorting label='Sort By' sortOptions={[{ name: 'relevance', value: '', direction: '' }, { name: 'no relevance at all!', value: '', direction: '' }]} />
//   <Facet field='concepts' label='nope' filterType='any' />
//             </div >
//           }

const SearchComposition = ({ wasSearched, isLoading }) => {
  return (
    <div className='search-root'>
      <ErrorBoundary>
        <Layout
          header={<SearchBox
            autocompleteResults={{
              sectionTitle: "Suggested Results",
              titleField: "title",
            }}
            autocompleteSuggestions={{
              sectionTitle: "Suggested Queries"
            }}
          />}
          bodyHeader={<>
            {isLoading && <p>I am loading now. okay?</p>}
            {wasSearched && <PagingInfo />}
          </>}
          bodyContent={<Results titleField='title' />}
          bodyFooter={<Paging />}
        />
      </ErrorBoundary>
    </div>
  )
}

export const SearchView = (props) => {
  return (
    <SearchProvider config={searchConfig}>
      <WithSearch mapContextToProps={({ wasSearched, isLoading }) => ({ wasSearched, isLoading })}>
        {(props) => <SearchComposition {...props}/>}
      </WithSearch>
    </SearchProvider>
  )
}

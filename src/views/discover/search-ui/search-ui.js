import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import { useStore } from 'effector-react'

import {
  WithSearch, SearchProvider, ErrorBoundary,
  SearchBox, Facet, ResultsPerPage, Sorting, Paging, PagingInfo,
} from '@elastic/react-search-ui'
import {
  MultiCheckboxFacet, SingleSelectFacet, SingleLinksFacet, BooleanFacet,
} from '@elastic/react-search-ui-views'

import { NonIdealState, Button, InputGroup } from '@blueprintjs/core'
import { viewportEvent, $layerSource } from '../store'
import { searchConfig, didTouchAutocompleteItem } from './connector'
import { ResourceGrid, Pagination } from '~components/resources'
import { ConceptListLoadingState, ConceptList, ConceptTag } from '~components/concepts'
import { WikiCard } from '~components/cards'


const AutocompleteContainer = styled.div`
  position: absolute;
  padding: 5px 10px;
  max-height: 300px;
  overflow: auto;

  left: 0;
  right: 0;
  top: 100%;

  z-index: 10;

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
    <ConceptTag {...nodeData}/>
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
    <NonIdealState
      title='Browse or Search for Resources'
      icon='path-search'>
      <div>
        <WikiCard title='Science' lang='en'/>
        <WikiCard title='Society' lang='en'/>
        <WikiCard title='History' lang='en'/>
      </div>
    </NonIdealState>
  )
}

const ResultView = ({ results, wasSearched, isLoading }) => {
  // this shows a grid full of search results.
  if (isLoading) {
    return <ConceptListLoadingState/>
  }
  return <div>
    {wasSearched && results
      ? <ResourceGrid resources={results}/>
      : <PlaceHolder/>
    }
  </div>
}


const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  const onTouchAutocompleteItem = item => didTouchAutocompleteItem(item, props)
  const layer = useStore($layerSource)

  console.log(layer)

  React.useEffect(() => {
    return viewportEvent.click.watch(event => {
      const { source, data } = event
      props.setFilter('source', source)
      props.setSearchTerm(data.title, { shouldClearFilters: false })
      // onTouchAutocompleteItem({ source, ...data })
    })
  })
  return (
    <div className='search-root'>
      <div className='tools overlay'>
        <SearchBox
          autocompleteResults={true}
          autocompleteView={AutocompleteResults}
          onSelectAutocomplete={onTouchAutocompleteItem}/>
        <div className='tools'>
          <div className='available'>
          </div>
          { false &&
            <div className='unavailable'>
              <Facet field='user' label='Map' view={SingleLinksFacet} />
              <Facet field='portal' label='Portals' view={MultiCheckboxFacet} />
              <Facet field='n_users' label='in nUsers Library' view={SingleLinksFacet} />
              <Facet field='n_tags' label='Has n-tags' view={SingleLinksFacet} />
              <Facet field='academic_discipline' label='academic_discipline' view={MultiCheckboxFacet} />
              <ResultsPerPage options={[10, 20, 30]} />
            </div>
          }
        </div>
      </div>
      <ErrorBoundary>
        <div className='results'>
          <div className='items'>
            <div className='search-info'>
              <div className='state'>
                {isLoading && <ConceptListLoadingState/>}
                {wasSearched && <PagingInfo />}
              </div>
            </div>
            <ResultView results={props.results} wasSearched={wasSearched} loading={isLoading}/>
            {wasSearched && <Paging view={Pagination}/>}
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

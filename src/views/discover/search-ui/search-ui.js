import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import { useStore } from 'effector-react'

import {
  WithSearch, SearchProvider, ErrorBoundary,
  SearchBox, Facet, ResultsPerPage, Sorting, Paging, PagingInfo,
} from '@elastic/react-search-ui'
import {
  MultiCheckboxFacet, SingleSelectFacet, SingleLinksFacet, BooleanFacet, SearchInput,
} from '@elastic/react-search-ui-views'

import { NonIdealState, Button, InputGroup, Switch, Spinner } from '@blueprintjs/core'
import { viewportEvent, didPickTag, $markerSelection } from '../store'
import { searchConfig, didTouchAutocompleteItem } from './connector'
import { ResourceGrid, Pagination, ResourceListView } from '~components/resources'

import { $globalContext } from '~page-commons/store'
import { HashtagPicker } from '../widgets'

import PagingState from './PagingState'


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
      viewportEvent.focusNode({ ...nodeData, ...repr})
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
    <NonIdealState
      title='Browse or Search for Resources'
      icon='path-search'>
      <div>
        {props.loading && <Spinner/>}
      </div>
    </NonIdealState>
  )
}

const ZeroResultsPlaceHolder = (props) => {
  return (
    <NonIdealState
      title='No Results'
      icon='path-search'>
    </NonIdealState>
  )
}

const ResultView = ({ results, wasSearched, loading, listView=true }) => {
  // this shows a grid full of search results.
  const ItemView = listView
    ? <ResourceListView resources={results}/>
    : <ResourceGrid resources={results}/>

  if (!loading && results.length === 0) {
    return <ZeroResultsPlaceHolder/>
  }

  return <div className='result-grid'>
    {!loading && wasSearched && results
      ? ItemView
      : <PlaceHolder loading={loading}/>
    }
  </div>
}

const ErrorBoundaryView = ({ error, children }) => {
  if (error) {
    return <NonIdealState
      title='An unexpected error occured'
      icon='offline'
    />
  }
  return children
}


const ToolDiv = styled.div`
  margin: 5px 0;
`

const SearchComposition = ({ wasSearched, isLoading, ...props }) => {
  const onTouchAutocompleteItem = item => didTouchAutocompleteItem(item, props)
  const [resultViewAsList, setResultViewType] = React.useState(true)

  const didSubmitSearchQuery = (q) => {
    props.setFilter('source', 'text')
    props.setSearchTerm(q, { shouldClearFilters: false })
  }

  const didClickReset = () => {
    props.setSearchTerm('', { shouldClearFilters: true })
    $markerSelection.clear()
  }

  return (
    <div className='search-root'>
      <div className='tools overlay'>
        <SearchBox
          autocompleteResults={true}
          autocompleteView={AutocompleteResults}
          onSelectAutocomplete={onTouchAutocompleteItem}
          onSubmit={didSubmitSearchQuery}/>
        <div className='tools'>
          <div className='available'>
            <ToolDiv>
              <HashtagPicker/>
            </ToolDiv>
            <ToolDiv>
              <Switch
                label='View as list'
                checked={resultViewAsList}
                onChange={() => setResultViewType(!resultViewAsList)}/>
            </ToolDiv>
            <ToolDiv>
              {wasSearched && <Button
                text='Reset Search'
                small minimal
                onClick={didClickReset}
                icon='refresh'
              />}
            </ToolDiv>
          </div>
          { false &&
            <div className='unavailable'>
              <Facet field='hashtags' label='Hashtags' view={SingleLinksFacet} />
              <Facet field='user' label='Map' view={SingleLinksFacet} />
              <Facet field='n_users' label='in nUsers Library' view={SingleLinksFacet} />
              <Facet field='n_tags' label='Has n-tags' view={SingleLinksFacet} />
              <Facet field='academic_discipline' label='academic_discipline' view={MultiCheckboxFacet} />
              <ResultsPerPage options={[10, 20, 30]} />
            </div>
          }
        </div>
      </div>
      <ErrorBoundary view={ErrorBoundaryView}>
        <div className='results'>
          <div className='search-info'>
            <div className='state'>
              {wasSearched && <PagingInfo view={PagingState} isLoading={isLoading}/>}
            </div>
          </div>
          <ResultView
            results={props.results}
            wasSearched={wasSearched}
            loading={isLoading}
            listView={resultViewAsList}/>
          {wasSearched && <Paging view={Pagination}/>}
        </div>
      </ErrorBoundary>
    </div>
  )
}

export const SearchView = ({ driver, ...props }) => {

  return (
    <SearchProvider driver={driver}>
      <WithSearch mapContextToProps={ctx => ctx}>
        {(props) => <SearchComposition {...props}/>}
      </WithSearch>
    </SearchProvider>
  )
}

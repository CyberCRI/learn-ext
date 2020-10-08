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
import { viewportEvent } from '../store'
import { searchConfig, didTouchAutocompleteItem } from './connector'


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
            <div className='available'>
              <Facet field='user' label='Map' view={SingleLinksFacet} />
            </div>
            <div className='unavailable'>
              <Facet field='portal' label='Portals' view={MultiCheckboxFacet} />
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

// High order component to update bounds when images load.
//
// Fork of https://github.com/dantrain/react-stonecutter
// MIT License (Copyright (c) 2016 Dan Train)
import React, { Component } from 'react'
import partition from 'lodash.partition'
import debounce from 'lodash.debounce'

const imagesLoaded =
  typeof window !== 'undefined' ? require('imagesloaded') : null

export default (Grid, { measureImages, background } = {}) =>
  class extends Component {
    constructor(props) {
      super(props)

      this.rects = {}
      this.loading = {}
      this.retryTimeouts = {}

      this.state = {
        rects: {},
      }
    }

    componentDidMount() {
      this.updateRectsDebounced = debounce(this.updateRects, 10)
      this.measureElements()
    }

    componentDidUpdate() {
      this.measureElements()
    }

    componentWillUnmount() {
      Object.keys(this.retryTimeouts).forEach(key => {
        clearTimeout(this.retryTimeouts[key])
      })
    }

    measureElements () {
      if (this.elementsToMeasureContainer) {
        const elements = this.elementsToMeasureContainer.children

        if (elements.length) {
          if (measureImages) {
            Array.from(elements)
              .filter(el => !this.loading[el.dataset.stonecutterkey])
              .forEach(el => {
                this.loading[el.dataset.stonecutterkey] = true

                imagesLoaded(el, { background }, () => {
                  this.measureElementWithImages(el, 10)
                })
              })
          } else {
            this.rects = Array.from(elements).reduce((acc, el) => {
              acc[el.dataset.stonecutterkey] = el.getBoundingClientRect()
              return acc
            }, {})

            this.updateRects()
          }
        }
      }
    }

    measureElementWithImages (el, retries) {
      const clientRect = el.getBoundingClientRect()

      if (clientRect && clientRect.height > 0) {
        this.rects[el.dataset.stonecutterkey] = clientRect
        delete this.loading[el.dataset.stonecutterkey]
        this.updateRectsDebounced()
      } else if (retries > 0) {
        clearTimeout(this.retryTimeouts[el.dataset.stonecutterkey])
        this.retryTimeouts[el.dataset.stonecutterkey] = setTimeout(
          this.measureElement,
          10,
          el,
          --retries
        )
      }
    }

    updateRects() {
      this.setState(state => {
        const { rects } = this
        this.rects = {}

        return {
          rects: {
            ...state.rects,
            ...rects,
          },
        }
      })
    }

    render() {
      const { component, children, columnWidth } = this.props
      const { rects } = this.state

      const [newElements, existingElements] = partition(
        React.Children.toArray(children),
        element => !rects[element.key]
      )

      const elementsToMeasure = newElements.map(element =>
        React.cloneElement(element, {
          style: {
            ...element.props.style,
            width: columnWidth,
          },
          'data-stonecutterkey': element.key,
        })
      )

      const measuredElements = existingElements.map(element =>
        React.cloneElement(element, {
          itemRect: rects[element.key],
        })
      )

      return (
        <>
          {measuredElements.length > 0 && (
            <Grid {...this.props}>{measuredElements}</Grid>
          )}
          {elementsToMeasure.length > 0 &&
            React.createElement(
              'div',
              {
                style: {
                  width: 0,
                  height: 0,
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  visibility: 'hidden',
                },
                ref: el => {
                  this.elementsToMeasureContainer = el
                },
              },
              elementsToMeasure
            )}
        </>
      )
    }
  }

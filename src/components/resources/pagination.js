import React, { Component } from 'react'
import { Button, Intent } from '@blueprintjs/core'

const CELL_COUNT = 7
const CELL_MID_LEN = ~~(CELL_COUNT / 2)


class Pagination extends Component {
  // This component implements pagination buttons such as these:
  // ┌───┬───┬───┬───┬───┐
  // │ < │ 1 │ 2 │ 3 │ > │
  // └───┴───┴───┴───┴───┘
  // ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
  // │ < │ 1 │ 2 │ 3 │ 4 │...│ 9 │10 │ > │
  // └───┴───┴───┴───┴───┴───┴───┴───┴───┘
  // ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
  // │ < │ 1 │...│ 4 │ 5 │ 6 │...│10 │ > │
  // └───┴───┴───┴───┴───┴───┴───┴───┴───┘
  //
  // To implement the logic, consider a n page count in an Array struct.
  // => [1, 2, 3, ..., n-1, n]
  // Let p be current page.
  // We have two possible ellipsis positions at 2 (a), and n-1 (b). We need to
  // find if either of these ellipsis positions should be shown as ellipsis or
  // as numbers.
  // We see that if n <= CELL_COUNT, {a, b} := {false, false}
  // In other cases, if p < (CELL_COUNT / 2), {a, b} := {false, true}
  // and if p > (CELL_COUNT / 2), {a, b} := {true, false}.

  constructor (props) {
    super(props)
    this.state = {
      totalCount: props.totalCount || 0,
      current: props.current || 1,
    }

    this.paginate = (nr) => props.onPaginate(nr)
  }

  componentWillReceiveProps (props) {
    this.state = {
      totalCount: props.totalCount,
      current: props.current || 1,
    }
  }

  getPagingLayout () {
    const totalCount = this.state.totalCount, current = this.state.current
    let pages = []

    if (totalCount > CELL_COUNT) {
      // Fill in first and last positions
      pages[0] = { nr: 1 }
      pages[1] = { nr: 2 }
      pages[CELL_COUNT - 2] = { nr: totalCount - 1 }
      pages[CELL_COUNT - 1] = { nr: totalCount }

      if (current <= CELL_MID_LEN) {
        // b ellipse is enabled and the rest of the array is filled
        pages[CELL_COUNT - 2].ellipsis = true
        for (let i = 2; i < CELL_COUNT - 2; i++) {
          pages[i] = { nr: i + 1 }
        }
      } else if ((totalCount - current) < CELL_MID_LEN) {
        // a ellipsis is enabled and the later part of array is filled
        pages[1].ellipsis = true
        for (let i = 2; i < CELL_COUNT - 2; i++) {
          pages[i] = { nr: totalCount - CELL_COUNT + i + 1 }
        }
      } else {
        // both a and b ellipsis are enabled
        pages[1].ellipsis = true
        pages[CELL_COUNT - 2].ellipsis = true

        // Current selected is put in centre
        pages[CELL_MID_LEN] = { nr: current }
        // Fill next and prev to mid point
        // CELL_COUNT - 5 := n{MID, FIRST, SECOND, LAST, SECONDLAST}
        for (let i = 1; i < CELL_COUNT - 5; i++) {
          pages[CELL_MID_LEN + i] = { nr: current + i }
          pages[CELL_MID_LEN - i] = { nr: current - i }
        }
      }
    } else {
      for (let i = 0; i < totalCount; i++) {
        pages[i] = { nr: i + 1, ellipsis: false }
      }
    }

    pages.forEach(p => {
      if (p.nr === this.state.current) {
        p.active = true
      }
    })

    return pages
  }

  render () {
    const ltEnable = this.state.current > 1
    const rtEnable = this.state.current < this.state.totalCount
    const pages = this.getPagingLayout()

    return (
      <div className='pt-button-group'>
        <Button
          icon='chevron-left'
          disabled={!ltEnable}
          onClick={() => this.paginate(this.state.current - 1)}/>
        {pages.map(p =>
          <Button
            text={p.ellipsis ? '...' : p.nr}
            key={p.nr}
            disabled={p.ellipsis}
            intent={p.active ? Intent.PRIMARY : Intent.DEFAULT}
            onClick={() => this.paginate(p.nr)}/>
        )}
        <Button
          icon='chevron-right'
          disabled={!rtEnable}
          onClick={() => this.paginate(this.state.current + 1)}/>
      </div>
    )
  }
}

export default Pagination

import React from 'react'
import { Button, ButtonGroup } from '@blueprintjs/core'

const CELL_COUNT = 8

function pagingCells (n, pos, maxCells=CELL_COUNT) {
  // Consider an array of pages with length `n`. Let `p` be cursor position.
  //  [1, 2, 3, ..., n-1, n]
  //
  // Requirements:
  // - In all cases we want to keep `1` and `n` visible.
  // - We cant render more than CELL_COUNT items.
  // - If the cells exceed CELL_COUNT, insert `...` wherever appropriate.
  const offset = n - pos
  const pivot = ~~(maxCells / 2)

  let cells = []

  if (n > CELL_COUNT) {
    // Fill in first and last positions
    cells[0] = { nr: 1 }
    cells[1] = { nr: 2 }
    cells[CELL_COUNT - 2] = { nr: n - 1 }
    cells[CELL_COUNT - 1] = { nr: n }

    if (pos <= pivot) {
      // last ellipse is enabled and the rest of the array is filled
      cells[CELL_COUNT - 2].ellipsis = true
      for (let i = 2; i < CELL_COUNT - 2; i++) {
        cells[i] = { nr: i + 1 }
      }
    } else if (offset < pivot) {
      // a ellipsis is enabled and the later part of array is filled
      cells[1].ellipsis = true
      for (let i = 2; i < CELL_COUNT - 2; i++) {
        cells[i] = { nr: n - CELL_COUNT + i + 1 }
      }
    } else {
      // both a and b ellipsis are enabled
      cells[1].ellipsis = true
      cells[CELL_COUNT - 2].ellipsis = true

      // Current selected is put in centre
      cells[pivot] = { nr: pos }
      // Fill next and prev to mid point
      // CELL_COUNT - 5 := n{MID, FIRST, SECOND, LAST, SECONDLAST}
      for (let i = 1; i < CELL_COUNT - 5; i++) {
        cells[pivot + i] = { nr: pos + i }
        cells[pivot - i] = { nr: pos - i }
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      cells[i] = { nr: i + 1, ellipsis: false }
    }
  }
  return cells
}

export const Pagination = ({count, cursor, onPaginate, maxCells=CELL_COUNT}) => {
  // Renders a Pagination Button Group, inserting ellipsis based on cursor.
  // ┌───┬───┬───┬───┬───┐
  // │ < │ 1 │ 2 │ 3 │ > │
  // └───┴───┴───┴───┴───┘
  // ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
  // │ < │ 1 │ 2 │ 3 │ 4 │...│ 9 │10 │ > │
  // └───┴───┴───┴───┴───┴───┴───┴───┴───┘
  // ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
  // │ < │ 1 │...│ 4 │ 5 │ 6 │...│10 │ > │
  // └───┴───┴───┴───┴───┴───┴───┴───┴───┘

  const PrevPage = <Button
    icon='arrow-left'
    disabled={cursor <= 1}
    onClick={() => onPaginate(cursor - 1)}
    text='Previous'/>

  const NextPage = <Button
    rightIcon='arrow-right'
    disabled={cursor >= count}
    onClick={() => onPaginate(cursor + 1)}
    text='Next'/>

  return (
    <ButtonGroup className='pagination'>
      {PrevPage}
      {pagingCells(count, cursor, maxCells).map(({ nr, ellipsis }) =>
        <Button
          text={!ellipsis && nr}
          icon={ellipsis && 'more'}
          disabled={ellipsis}
          key={nr}
          active={nr === cursor}
          onClick={() => onPaginate(nr)}/>
      )}
      {NextPage}
    </ButtonGroup>
  )
}

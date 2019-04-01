import React, { useState, useEffect } from 'react'
import { Card, Elevation, AnchorButton, ButtonGroup } from '@blueprintjs/core'
import _ from 'lodash'

import Wiki from '~mixins/wikipedia'


const SkeletonCard = () => (
  <Card interactive elevation={Elevation.TWO} className='info-card'>
    <h3 role='title' className='bp3-skeleton'>Boop</h3>
    <p role='text'>
      {_.range(20).map(() =>
        <span className='bp3-skeleton'>Boop </span>
      )}
    </p>
    <div role='image' className='bp3-skeleton'/>
  </Card>
)


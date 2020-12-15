import React from 'react'
import { Button, Divider, ButtonGroup} from '@blueprintjs/core'
import { useStore } from 'effector-react'

import { didPickLayer, $layersAvailable, $layerSource } from '../store'


export const LayerPicker = (props) => {
  const layers = useStore($layersAvailable)
  const currentLayer = useStore($layerSource)

  return (
    <div className='widget layers'>
      <h5>Featured Maps</h5>
      <Divider/>
      <ButtonGroup vertical minimal className='layers'>
        {layers.map((layer) => (
          <Button
            key={layer.id}
            icon={layer.icon}
            text={layer.label}
            active={layer.id === currentLayer.id}
            onClick={() => didPickLayer(layer)}/>
        ))}
      </ButtonGroup>
    </div>
  )
}

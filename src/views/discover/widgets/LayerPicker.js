import React from 'react'
import { Button, Divider, ButtonGroup} from '@blueprintjs/core'
import { useStore } from 'effector-react'

import { i18n } from '@ilearn/modules/i18n'
import { $globalContext } from '~page-commons/store'

import { MapLayerSources } from '../consts'
import { didPickLayer, $layerSource } from '../store'


export const LayerPicker = (props) => {
  const i18nT = i18n.context('pages.discover.sections.atlas.layers')
  const node = useStore($globalContext)
  const currentLayer = useStore($layerSource)

  const userLayers = []

  if (node.authorized) {
    userLayers.push({
      id: node.user.email,
      label: i18nT`user`,
      src: node.user.email,
      icon: 'layout-circle',
      user: true,
    })

    if (node.user.groups.length > 0) {
      // [!todo] support more than 1 group.
      const group = node.user.groups[0]

      userLayers.push({
        id: `${group.guid}@group`,
        label: i18nT`group`,
        src: `${group.guid}@group`,
        icon: 'layout-group-by',
        user: true,
      })
    }
  }

  return (
    <div className='widget layers'>
      <h5>Featured Maps</h5>
      <Divider/>
      <ButtonGroup vertical minimal className='layers'>
        {MapLayerSources.map((layer) => (
          <Button
            key={layer.id}
            icon={layer.icon}
            text={layer.label}
            active={layer.id === currentLayer.id}
            onClick={() => didPickLayer(layer)}/>
        ))}
        {userLayers.length > 0 && <Divider/>}
        {userLayers.map((layer) => (
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

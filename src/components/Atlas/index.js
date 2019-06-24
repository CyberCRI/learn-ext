import React, { useRef, useEffect } from 'react'
import clsx from 'classnames'
import _ from 'lodash'
import { useMount } from 'react-use'

const PortalLUT = {
  'arts': [60, 126, 162, 255],
  'geographie': [104, 183, 140, 255],
  'histoire': [215, 135, 66, 255],
  'politique_et_religions_et_croyances': [118, 78, 162, 255],
  'sciences_et_medecine': [152, 54, 109, 255],
  'societe': [211, 115, 135, 255],
  'sport_et_loisirs': [20, 204, 189, 255],
  'technologies': [69, 128, 230, 255],
}

const AtlasView = ({ onReady }) => {
  // Mounts a Canvas inside dom, passes its reference to the
  // dotAtlas instance
  const mapContainer = useRef(null)

  useMount(() => {
    // Inform parent when container is ready to use. Pass on the element ref.
    // Initialise the DotAtlas object, attach the container element,
    // and register the event proxies.

    Cartographer(mapContainer, )
  })

  useEffect(() => {
    // Accept changes to props and handle them.
    // Essentially we'd be handling overlays and data point changes?
  })

  // TODO: Hook based handlers and callback registration for
  //       interactive hover and stuff. We'll also try to remove
  //       the return object.

  return (
    <div className='mapbox' ref={mapContainer}/>
  )
}


export default AtlasView

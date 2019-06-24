import { useSetState } from 'react-use'

export const useCssVars = (initialVars={}) => {
  // Transform style overrides through css variables.
  // Use plain string values in object. Please!
  // [NOTE] I was going to make it slightly more complex to handle urls, but
  // it's actually better to not do it.
  //
  // [Example]:
  //
  // - Initialise the hook:
  //    const [ cssVars, setCssVars ] = useCssVars({ height: '10px' })
  //
  // - Update Variables (or append new ones):
  //    useEffect(() => {
  //      [...]
  //      setCssVars({ height: '20px', width: '20px' })
  //    })
  //
  // - Spread the style object:
  //    <Component {...cssVars}/>
  //
  // That's equivalent to this:
  //    => <Component style={{ '--height': '20px', '--width': '20px' }}/>

  const transformVars = (cssVars) => {
    // Transforms variables to the ugly `--variableName` format that CSS loves.
    return _(cssVars)
      .mapKeys((value, key) => `--${key}`)
      .thru((style) => ({ style }))
      .value()
  }

  // Initialize a setState hook with transformed values in parameters.
  const [ values, setValues ] = useSetState(transformVars(initialVars))
  const setCssVars = (vars) => setValues(transformVars(vars))

  return [ values, setCssVars ]
}

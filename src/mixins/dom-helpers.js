import $ from 'cash-dom'

export const getMetaAttribute = (name) => {
  return $(`meta[name="${name}"]`).attr('content')
}

export const getCanonicalUrl = () => {
  const canonical = $('link[rel="canonical"]').attr('href')
  if (canonical) {
    return canonical
  } else {
    return document.location.href
  }
}

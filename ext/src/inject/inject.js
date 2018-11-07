$(document).ready(function () {
  $.get(chrome.extension.getURL('src/inject/toolbar.html'), (data) => {
    $(data).appendTo('body')

    $('#np-toggle').click((e) => {
      $('.np-ext .tags').toggleClass('open')
    })
  })
})

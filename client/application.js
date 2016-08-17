import $ from 'jquery'
window.$ = $
window.jQuery = $
require('floatthead')
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  let valFocus
  $('input[type="text"].form-control')
    .on('focus', function () {
      valFocus = $(this).val()
      // console.log('$(this).val()', $(this).val())
      $(this).addClass('champ')
    })
    .on('blur', function () {
      const blur = $(this)
      $(this).removeClass('champ')
      // console.log('blur.val()', blur.val())
      if (valFocus !== blur.val()) {
        $.ajax({
          type: 'POST',
          url: 'http://localhost:3000/update',
          data: {'key': $(this).attr('data-key'), 'value': $(this).val(), 'language': $(this).attr('data-lang')},
          timeout: 3000,
          success: function (data) {
            console.log(data)
            blur.addClass('class')
            window.setTimeout(function () { blur.addClass('class1') }, 10)
            blur.removeClass('class1')
          },
          error: function () { alert("La requête n'a pas aboutit") }
        })
      }
    })

  $('button[type="button"]').on('click', function () {
    if (confirm('Voulez-vous vraiment supprimer cette clé?')) { // Clic sur OK
      const key = $(this).data('inputkey')
      $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3000/delete',
        data: {'key': key},
        timeout: 3000,
        success: function (data) {
          console.log(data)
          removeLine(key.replace(/\./gi, '-'))
          function removeLine (string) {
            $('#row_' + string).remove()
          }
        },
        error: function () { alert("La requête n'a pas aboutit") }
      })
    }
  })
  $('.search').on('focus', function () {
    if (this.value === 'Rechercher...') {
      this.value = ''
    }
    $('.search').on('blur', function () {
      if (this.value === '') {
        this.value = 'Rechercher...'
      }
    })
  })

  $('input[type="search"].search').on('keyup', function () {
    let search = $(this).val()
    if (search === '') {
      $('tbody tr td input').removeClass('found')
      $('tbody tr').show()
    } else if (search !== '') {
      recherche(search)
    }
  })

  $('table').floatThead({
    position: 'fixed'
  })
})

function recherche (search) {
  $('tbody tr').hide()
  $('tbody tr[id*="' + search + '"]').show()
  $('tbody tr td input').removeClass('found')
  $('tbody tr td input[value*="' + search + '"]').addClass('found').closest('tr').show()
}

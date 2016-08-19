import $ from 'jquery'
window.$ = $
window.jQuery = $
require('floatthead')
import tether from 'tether'
window.Tether = tether
require('bootstrap')
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  let editedId
  // ----------------------------------------------------------------------------------
  // Mise en place de la modal au clic sur une ligne
  // ----------------------------------------------------------------------------------
  $('.line').on('click', function () {
    const $this = $(this)
    editedId = $this.data('key')

    $('#myModal').modal('show')
    $('.modal-title').html('Clé : ' + $this.data('key'))
    $this.find('textarea').each(function () {
      const lang = $(this).data('lang')
      $('.modal-body .form-group[data-lang="' + lang + '"]').append($(this))
    })
  })

  $('#myModal').on('hidden.bs.modal', function () {
    $(this).find('textarea').each(function () {
      const lang = $(this).data('lang')
      $('tr[data-key="' + editedId + '"] td[data-lang="' + lang + '"]').append($(this))
    })
  })
  // ----------------------------------------------------------------------------------
  // Requete Ajax pour le update des valeurs
  // ----------------------------------------------------------------------------------
  let valFocus
  $('textarea.form-control')
    .on('focus', function () {
      valFocus = $(this).val()
    // console.log('$(this).val()', $(this).val())
    })
    .on('blur', function () {
      const blur = $(this)
      // console.log('blur.val()', blur.value())
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
  // ----------------------------------------------------------------------------------
  // Requete Ajax pour le delete des clées
  // ----------------------------------------------------------------------------------
  $('button[data-spec="spec"]').on('click', function () {
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
  // -------------------------------------------------------------------------------
  // Mise en place de la recherche
  // -------------------------------------------------------------------------------
  $('input.search').on('keyup', function () {
    let search = $(this).val()
    if (search === '') {
      $('tbody tr td input').removeClass('found')
      $('tbody tr').show()
    } else if (search !== '') {
      recherche(search)
    }
  })
  // ----------------------------------------------------------------------------
  // Thead en float pour le scrolling
  // ----------------------------------------------------------------------------
  $('table').floatThead({
    position: 'fixed'
  // scrollContainer: function ($table) {
  //   return $table.closest('.wrapper')
  // }
  })
})

function recherche (search) {
  $('tbody tr').hide()
  $('tbody tr[id*="' + search + '"]').show()
  $('tbody tr td input').removeClass('found')
  $('tbody tr td input[value*="' + search + '"]').addClass('found').closest('tr').show()
}

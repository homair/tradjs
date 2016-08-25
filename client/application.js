import $ from 'jquery'
window.$ = $
window.jQuery = $
require('floatthead')
import tether from 'tether'
window.Tether = tether
require('bootstrap')
import bootbox from 'bootbox'
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  let editedId
  // ----------------------------------------------------------------------------------
  // Mise en place de la modal au clic sur une ligne
  // ----------------------------------------------------------------------------------
  $('.modTrig').on('click', function () {
    const $tr = $(this).closest('tr')
    editedId = $tr.data('key')

    $('#myModal').modal('show')
    $('.modal-title').html('Clé : ' + $tr.data('key'))
    $tr.find('textarea').each(function () {
      const lang = $(this).data('lang')
      $('.modal-body .form-group[data-lang="' + lang + '"]').append($(this))
    })
  })
  $('#myModal').on('shown.bs.modal', function () {
    $('textarea[data-lang="fr"]', $(this)).focus()
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
  $('button[data-confirm="confirmation"]').on('click', function () {
    const key = $(this).data('inputkey')
    bootbox.confirm('Etes vous sûr de vouloir supprimer cette ligne?', function (result) {
      if (result === true) {
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
  })

  // -------------------------------------------------------------------------------
  // Mise en place de la recherche
  // -------------------------------------------------------------------------------
  $('input.search').on('keyup', function () {
    let search = $(this).val()
    if (search === '') {
      $('tbody tr td textarea').removeClass('found')
      if ($('th.pliage').hasClass('pliage')) {
        $('tr[id*="row_"]').hide()
        $('tbody tr[class="affichage"]').show()
        $('tbody tr[class="affichage_ss_niveau"]').show()
      }
    } else if (search !== '') {
      recherche(search)
    }
  })
  $('input.search').focus()
  // ----------------------------------------------------------------------------
  // Thead en float pour le scrolling
  // ----------------------------------------------------------------------------
  $('table').floatThead({
    position: 'fixed'
  })
  // -----------------------------------------------------------------------------
  // Réuni les racines des clés sous forme de th pliantes et dépliantes
  // -----------------------------------------------------------------------------
  let racine = ''
  let racinessniveau = ''
  $('tr').find('span[id*="data"]').each(function (index, element) {
    let key = $(element).data().key
    let arrayOfKey = key.split('.')

    if (racine !== arrayOfKey[0]) {
      racine = arrayOfKey[0]
      $(element).closest('tr').before('<tr class="affichage"><th class="pliage" data-root="' + racine + '">' + racine + '</th></tr>')
    // console.log('racine', racine)
    }
    if (racinessniveau !== arrayOfKey[1]) {
      racinessniveau = arrayOfKey[1]
      if (typeof racinessniveau === 'undefined') return
      $(element).closest('tr').before('<tr class="affichage_ss_niveau"><th class="pliage_ss_niveau" data-root="' + racine + '-' + racinessniveau + '">' + racine + '.' + racinessniveau + '</th></tr>')
      $('tr[id*="' + racine + '-' + racinessniveau + '"]').addClass('pliage_spec')
    }
  })

  $('th.pliage').on('click', function () {
    const $this = $(this)
    if ($this.hasClass('accordeon')) {
      $('th.pliage_ss_niveau[data-root*="' + $this.data('root') + '"]').hide()
      $('tr[id*="row_' + $this.data('root') + '"]').not('.pliage_spec').hide()
      $this.removeClass('accordeon')
      return
    }
    if ($this.hasClass('pliage')) {
      $('th.pliage_ss_niveau[data-root*="' + $this.data('root') + '"]').show()
      $('tr[id*="row_' + $this.data('root') + '"]').not('.pliage_spec').show()
      $this.addClass('accordeon')
    }
  })
  $('th.pliage_ss_niveau').on('click', function () {
    const $this = $(this)
    if ($this.hasClass('accordeon_ss_niveau')) {
      $('tr[id*="row_' + $this.data('root') + '"]').hide()
      $this.removeClass('accordeon_ss_niveau')
      return
    }
    if ($this.hasClass('pliage_ss_niveau')) {
      $('tr[id*="row_' + $this.data('root') + '"]').show()
      $this.addClass('accordeon_ss_niveau')
    }
  })

  $('tbody tr th[class="pliage"]').addClass('col-lg-12')
  $('tbody tr th[class="pliage_ss_niveau"]').addClass('col-lg-12')
  $('th.pliage_ss_niveau').hide()
  $('tr[id*="row"]').hide()
})

function recherche (search) {
  $('tbody tr').hide()
  $('tbody tr[id*="' + search + '"]').show()
  $('tbody tr th td textarea').removeClass('found')
  $('tbody tr th td textarea[value*="' + search + '"]').addClass('found').closest('tr').show()
}

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
  var _inputSearch = $('input.search')

  // ----------------------------------------------------------------------------------
  // Mise en place de la modal au clic sur une ligne
  // ----------------------------------------------------------------------------------
  $('.modTrig').on('click', function () {
    const $tr = $(this).closest('tr.line')
    editedId = $tr.attr('id')

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
      $('tr[id="' + editedId + '"] td[data-lang="' + lang + '"]').append($(this))
    })
  })

  // ----------------------------------------------------------------------------------
  // Requete Ajax pour le update des valeurs
  // ----------------------------------------------------------------------------------
  let valFocus
  $('textarea.form-control')
    .on('focus', function () {
      valFocus = $(this).val()
    })
    .on('blur', function () {
      const el = $(this)
      if (valFocus !== el.val()) {
        $.ajax({
          type: 'POST',
          url: window.location.origin + '/update',
          data: {'_id': $(this).data('id'), 'key': $(this).data('key'), 'value': $(this).val(), 'language': $(this).data('lang')},
          timeout: 3000,
          success: function (data) {
            if (data === 'ok') {
              el.addClass('class')
              window.setTimeout(function () { el.addClass('class1') }, 10)
              el.removeClass('class1')
            }
          },
          error: function (err) {
            bootbox.alert('Error while updating data : ' + err)
          }
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
          url: window.location.origin + '/delete',
          data: {'key': key},
          timeout: 3000,
          success: function (data) {
            if (data === 'ok') {
              removeLine(key)
            }
          },
          error: function (err) {
            bootbox.alert('Error while deleting data : ' + err)
          }
        })
      }
    })
  })

  // -------------------------------------------------------------------------------
  // Mise en place de la recherche
  // -------------------------------------------------------------------------------
  _inputSearch.on('keyup', function () {
    let search = $(this).val()

    saveToStorage(search)

    if (search === '') {
      resetGrouppedSearch()
    } else {
      recherche(search)
    }
  })
    .on('focus', function () {
      // Préselectionne le texte de la zone pour remplacement rapide.
      $(this).select()
    })
    // $('input.search').focus()

  // RESET search.
  $('#reset-search').on('click', function () {
    $('#searching').val('')
    resetSearch()
  })

  // Show untranslated keys.
  $('#suk').on('click', function () {
    if ($('#suk').hasClass('switch-on')) {
      window.location = '/'
      $('#suk').html('Show untranslated keys')
    } else {
      window.location = '/?v=flat'
      $('#suk').html('Hide untranslated keys')
    }
  })

  // ----------------------------------------------------------------------------
  // Thead en float pour le scrolling
  // ----------------------------------------------------------------------------
  $('table').floatThead({
    position: 'fixed'
  })

  // -----------------------------------------------------------------------------
  // Réunit les racines des clés sous forme de th pliantes et dépliantes
  // -----------------------------------------------------------------------------
  if ($('#tab_logic').data('regroup') === 1) {
    regroupLabels()
  } else {
    $('#suk').addClass('switch-on')
    $('#suk').html('Hide untranslated keys')

    $('textarea').filter(function () {
      if ($.trim($(this).text()) === '') {
        $(this).addClass('highlight').closest('tr').show().addClass('highlight')
      } else {
        $(this).closest('tr').hide()
      }
    })
  }

  var oldVal = restoreFromStorage()
  if (oldVal) {
    _inputSearch.val(oldVal)
    recherche(oldVal)
  }
})

// ==============================================================================================

function recherche (search) {
  $('tbody tr').hide()
  $('tbody tr[data-key*="' + search + '"]').show()
  $('tbody textarea').removeClass('found')
  // $('tbody textarea').filter().addClass('found').closest('tr').show()
  var re = new RegExp(search, 'ig')
  var ta = $('textarea').filter(function () { return re.test($(this).val()) })
  ta.closest('tr').show()
}

function resetGrouppedSearch () {
  $('tbody tr td textarea').removeClass('found')
  if ($('th.pliage').hasClass('pliage')) {
    $('tr.line').hide()
    $('tbody tr[class="affichage"]').show()
    $('tbody tr[class="affichage_ss_niveau"]').show()
  }
}
function resetSearch () {
  saveToStorage('')
  resetGrouppedSearch('')
}

function removeLine (key) {
  $('tr.line[data-key="' + key + '"]').remove()
}

function regroupLabels () {
  let racine = ''
  let racinessniveau = ''

  $('tr.line span.key').each(function (index, element) {
    let $this = $(this)
    let key = $this.data('key')

    let arrayOfKey = key.split('.')

    // On pose un niveau (pliable)
    if (racine !== arrayOfKey[0]) {
      racine = arrayOfKey[0]
      $this.closest('tr').before(`<tr class="affichage"><th class="pliage" data-root="${racine}">${racine}<span class="fa fa-chevron-down" aria-hidden="true"></span></th></tr>`)
    }

    // On pose un sous-niveau (pliable)
    if (racinessniveau !== arrayOfKey[1]) {
      racinessniveau = arrayOfKey[1]
      if (!racinessniveau) return
      $this.closest('tr').before(`<tr class="affichage_ss_niveau"><th class="pliage_ss_niveau" data-root="${racine}.${racinessniveau}">${racine}.${racinessniveau}<span class="fa fa-chevron-down" aria-hidden="true"></span></th></tr>`)
      $(`tr[data-key*="${racine}.${racinessniveau}"]`).addClass('pliage_spec')
    }
  })

  /* ----- Pliage et dépliage des lignes au moment du clic pour le premier niveau ------- */
  $('th.pliage').on('click', function () {
    const $this = $(this)
    const dataRoot = $this.data('root')
    if ($this.hasClass('accordeon')) {
      $('.fa-chevron-up', $this).hide()
      $('.fa-chevron-down', $this).show()
      $('.fa-chevron-up', $('th.pliage_ss_niveau')).hide()

      $('th.pliage_ss_niveau[data-root^="' + dataRoot + '"]').hide()
      $('tr[data-key^="' + dataRoot + '"]').not('.pliage_spec').hide()
      $('tr[data-key^="' + dataRoot + '"]').hide()
      $this.removeClass('accordeon')
      return
    }
    if ($this.hasClass('pliage')) {
      $('.fa-chevron-down', $this).hide()
      $this.append('<span class="fa fa-chevron-up" aria-hidden="true"></span>')
      $('.fa-chevron-down', $('th.pliage_ss_niveau')).show()

      $('th.pliage_ss_niveau[data-root^="' + dataRoot + '"]').show()
      $('tr[data-key^="' + dataRoot + '"]').not('.pliage_spec').show()
      $this.addClass('accordeon')
    }
  })

  /* ----- Pliage et dépliage des lignes au moment du clic pour le deuxième niveau ------- */
  $('th.pliage_ss_niveau').on('click', function () {
    const $this = $(this)
    const dataRoot = $this.data('root')
    if ($this.hasClass('accordeon_ss_niveau')) {
      $('.fa-chevron-up', $this).hide()
      $('.fa-chevron-down', $this).show()

      $('tr[data-key^="' + dataRoot + '"]').hide()
      $this.removeClass('accordeon_ss_niveau')
      return
    }
    if ($this.hasClass('pliage_ss_niveau')) {
      $('.fa-chevron-down', $this).hide()
      $this.append('<span class="fa fa-chevron-up" aria-hidden="true"></span>')

      $('tr[data-key^="' + dataRoot + '"]').show()
      $this.addClass('accordeon_ss_niveau')
    }
  })

  // $('tbody tr th[class="pliage"]').addClass('col-lg-12')
  // $('tbody tr th[class="pliage_ss_niveau"]').addClass('col-lg-12')
  $('th.pliage_ss_niveau').hide()
  $('tr.line').hide()
}

function saveToStorage (txt) {
  if (!window.localStorage) return
  if (txt) window.localStorage.setItem('tradjs-searchtext', txt)
  else window.localStorage.removeItem('tradjs-searchtext')
}
function restoreFromStorage () {
  if (!window.localStorage) return ''
  return window.defaultSearch !== '' ? window.defaultSearch : (window.localStorage.getItem('tradjs-searchtext') || '')
}

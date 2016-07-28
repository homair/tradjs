import $ from 'jquery'
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  $('input[type="text"]').on('blur', function () {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/update',
      data: {'key': $(this).attr('data-key'), 'value': $(this).val(), 'language': $(this).attr('data-lang')},
      timeout: 3000,
      success: function (data) {
        if (data === 'ok') {
          $(this).css('background-color', 'lightgreen')
        }
      },
      error: function () { alert("La requête n'a pas aboutit") }

    })
  /*$('#doc1Index_Homair').on('blur', function () {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/update',
      data: {'modif1': $('#doc0toto').val(), 'modif2': $('#doc1toto').val(), 'modif3': $('#doc0test').val(), 'modif4': $('#doc1test').val(), 'modif5': $('#doc0recherche').val(), 'modif6': $('#doc1recherche').val(), 'modif7': $('#doc0Index_Homair').val(), 'modif8': $('#doc1Index_Homair').val()},
      timeout: 3000,
      success: function (data) {
        if (data === 'ok') {
          $('#doc1Index_Homair').css('background-color', 'lightgreen')
        }
      },
      error: function () { alert("La requête n'a pas aboutit") }

    })
  })*/
  })
})

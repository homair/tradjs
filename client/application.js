import $ from 'jquery'
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  $('#doc0').on('blur', function () {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/update',
      data: {'modif1': $('#doc0').val()},
      timeout: 3000,
      success: function (data) {
        if (data === 'ok') {
          $('#doc0').css('background-color', 'lightgreen')
        }
      },
      error: function () { alert("La requète n'a pas aboutit") }

    })
  })
})

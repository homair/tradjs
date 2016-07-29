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
          $('input').attr(data).css('background-color', 'lightgreen')
          console.log($(this))
        }
      },
      error: function () { alert("La requête n'a pas aboutit") }

    })
  })
})

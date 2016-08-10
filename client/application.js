import $ from 'jquery'
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  $('input[type="text"]').on('blur', function () {
    const val = $(this)
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/update',
      data: {'key': $(this).attr('data-key'), 'value': $(this).val(), 'language': $(this).attr('data-lang')},
      timeout: 3000,
      success: function (data) {
        console.log(data)
        val.addClass('class')
        window.setTimeout(function () { val.addClass('class1') }, 10)
        val.removeClass('class')
      },
      error: function () { alert("La requête n'a pas aboutit") }

    })
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
})

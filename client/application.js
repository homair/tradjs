import $ from 'jquery'
import 'bootstrap/scss/bootstrap.scss'
import './styles/app.scss'

$(document).ready(function () {
  $('#mod').click(function () {
    $.post('http://localhost:3000/update?modif1=' + $('#doc0').val() + '&modif2=' + $('#doc1').val(), (data) => {
      alert(data.msg)
    })
  })
})

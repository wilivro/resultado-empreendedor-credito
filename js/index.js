var Service = (function($){
  'use strict';

  return {
    getStudents: function(){
      return $.when(
        $.getJSON('/resultado-empreendedor/estudantes.json'),
        $.getJSON('/resultado-empreendedor/estudantes-wiquadro.json')
      );
    }
  };
})(jQuery);

var Entrepreneur = (function($, Service) {
  'use strict';

  var $studentTable = $('.student-table');
  var $studentFilterField = $('#aluno');
  var $cityFilterField = $('#municipio');
  var $statusFilterField = $('#situacao');

  function studentTableRowTemplate(id, name, city, status) {
    return '<tr data-href="detalhes-aluno.html?id=' + id + '">' +
      '<td>' + name + '</td>' +
      '<td>' + city + '</td>' +
      '<td>' + status + '</td>' +
      '</tr>';
  }

  function getStatusByCode(code) {
    var statuses = [
      'Em Aberto',
      'Não Selecionado',
      'Selecionado para Premiação',
      'Selecionado para Crédito',
      'Finalista por Município',
      'Corrigido'
    ];

    return statuses[code];
  }

  function loadStudentTableWithData() {
    var $tableBody = $studentTable.find('tbody');

    Service.getStudents().done(function(glStudents, wiquadroStudents){
      glStudents = glStudents[0];
      wiquadroStudents = wiquadroStudents[0];

      $.each(glStudents.planos, function(i, row) {
        if (wiquadroStudents.hasOwnProperty(row.key)) {
          var student = wiquadroStudents[row.key];
          $tableBody.append(studentTableRowTemplate(student.chave, student.aluno, student.cidade, getStatusByCode(row.status)));
        }
      });

      showTotalStudents();
    });
  }

  function showTotalStudents () {
    $('.totalRows').html($studentTable.find('tbody tr:visible').length);
  }

  function filterTable() {
    $studentTable.find('tbody tr').hide();

    $studentTable.find('tr')
      .filter(function(){
        return $(this).text().toUpperCase().indexOf($studentFilterField.val().toUpperCase()) !== -1
          && $(this).text().toUpperCase().indexOf($cityFilterField.val().toUpperCase()) !== -1
          && $(this).text().toUpperCase().indexOf($statusFilterField.val().toUpperCase()) !== -1;
      }).show();

    showTotalStudents();
  }

  function onClickStudentTableRow() {
    window.location.href = $(this).data('href');
  }

  return {
    init: function() {
      loadStudentTableWithData();

      $studentTable.on('click', 'tbody tr', onClickStudentTableRow);
      $studentFilterField.on('keyup', $.debounce(300, filterTable));
      $cityFilterField.on('keyup', $.debounce(300, filterTable));
      $statusFilterField.on('change', $.debounce(300, filterTable));
    }
  };
})(jQuery, Service);

var StudentDetails = (function($, Service){
  'use strict';

  var $planoNegocioIframe = $('.plano-negocio');
  var $notas = $('.notas');

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split('=');

      if (pair[0] == variable) {
        return pair[1];
      }
    }

    return(false);
  }

  function showStudentGrades() {
    Service.getStudents().done(function(glStudents, wiquadroStudents){
      wiquadroStudents = wiquadroStudents[0];

      if (wiquadroStudents.hasOwnProperty(getQueryVariable('id'))) {
        var notas = wiquadroStudents[getQueryVariable('id')].notas;
        var $notasTableBody = $notas.find('table tbody');

        $.each(notas, function(i, row){
          $notasTableBody.append('<tr><td>' + row.disciplina + '</td><td>' + row.media + '</td></tr>');
        });
      }
    });
  }

  function setIframeSrc() {
    $planoNegocioIframe.attr('src', 'http://geralearning.wilivro.com.br/cursos/plano/ferramenta/desktop.asp?key=' + getQueryVariable('id'));
  }

  return {
    init: function(){
      showStudentGrades();
      setIframeSrc();
    }
  };
})(jQuery, Service);

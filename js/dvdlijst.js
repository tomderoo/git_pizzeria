$(window).load(function(){
    $('#dvdlijst').dataTable({
        "bPaginate": true,
        "iDisplayLength": 15,
        "iDisplayStart": 0,
        "sPaginationType": "full_numbers",
        "aLengthMenu": [[15,30,-1], [15,30,"Alle DVD's"]],
        "bProcessing": true,
        "aaSorting": [[0,'asc'],[1,'asc']],
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [2] }
        ],
        "oLanguage": { "sUrl": "DataTables/media/js/datatables.nederlands.txt" }
    });

    // PHP-zoekfunctie onzichtbaar maken bij datatable
    if($().dataTable()) {
        $('.zoekbalk').hide();
    }

    $('.retour').submit(function(e){
        e.preventDefault();
        var filmId = $('[name=id]', this).val();
        dvdRetour(filmId, this);

    });

    $('.leen').submit(function(e){
        e.preventDefault();
        var filmId = $('[name=id]', this).val();
        dvdLeen(filmId, this);

    });
});

function dvdRetour(filmId, eForm) {
    // console.log("Retour " + filmId);
    // Ajax-connect
    var sUrl = "process.php";
    var sPostVars = {
        act: 'ajaxretour',
        id: filmId
    };
    $.post(
            sUrl,
            sPostVars,
            function(){
                // console.log("Ajaxretour Succes!");
                var thisForm = $('[name=id]', eForm).parent();
                thisForm.css({display: 'none'});
                var thisFormTD = thisForm.parent().parent();
                var nextForm = $('.leen', thisFormTD);
                nextForm.css({display: 'block'});
            });
};

function dvdLeen(filmId, eForm) {
    // console.log("Leen " + filmId);
    // Ajax-connect
    var sUrl = "process.php";
    var sPostVars = {
        act: 'ajaxleen',
        id: filmId
    };
    $.post(
            sUrl,
            sPostVars,
            function(){
                // console.log("Ajaxleen Succes!");
                var thisForm = $('[name=id]', eForm).parent();
                thisForm.css({display: 'none'});
                var thisFormTD = thisForm.parent().parent();
                var nextForm = $('.retour', thisFormTD);
                nextForm.css({display: 'block'});
            });
};

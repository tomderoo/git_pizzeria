/* 
 * JSON-verbinding met omdbapi.com
 * URL = http://www.omdbapi.com/?i=[imdbcode]&t=
 * geeft teruggave JSON-object
 * 
 * Dependencies:
 * - JQuery (hier gebruikt: v. 1.10.2)
 */

$(window).load(function(){
    
    // toevoegen event handlers op IMDBlinks
    // deze "a.imdblink"'s worden dynamisch toegevoegd (in dit geval door Twig) in de presentatielaag
    // aan elke individuele imdblink wordt een id doorgegeven die de imdb-code van die film bevat
    // (die informatie komt uit SQL-database)
    $('a.imdblink').on("click", function(e){
        e.preventDefault();
        var imdbid = this.id;
        showMovieData(imdbid);
    });
    
    // datatable van de filmlijst
    $('#filmlijst').dataTable({
        "bPaginate": true,
        "iDisplayLength": 15,
        "iDisplayStart": 0,
        "sPaginationType": "full_numbers",
        "aLengthMenu": [[15,30,-1], [15,30,"Alle films"]],
        "bProcessing": true,
        "aaSorting": [[2,'desc'],[0,'asc']],
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [1, 3] }
        ],
        "oLanguage": { "sUrl": "DataTables/media/js/datatables.nederlands.txt" }
    });
    
    // bij datatable laten verdwijnen van PHP-zoekinterface
    if ($().dataTable()) {
        $('.zoekbalk').hide();
    }
}); // einde window-load

function showMovieData(imdbid) {
    // JSON-data krijgen
    var sURL        = 'http://www.omdbapi.com'; // omdbapi, private API voor imdb-connectie
    var oOptions    = {i: imdbid};              // variabele t wordt niet meegegeven wegens onnodig
    $.getJSON(
            sURL,
            oOptions,
            function(imdbData){
                var filmObject = {
                    "titel"     : imdbData.Title,
                    "jaar"      : imdbData.Year,
                    "plot"      : imdbData.Plot,
                    "img"       : imdbData.Poster,
                    "regisseur" : imdbData.Director,
                    "acteurs"   : imdbData.Actors,
                    "filmid"    : imdbData.imdbID
                };
                // aanroep van de renderfunctie met doorgave van het inhoudsobject
                displayFilm(filmObject);
            }
    );
};

function displayFilm(filmObject) {
    // renderfunctie voor inhoudsobject
    
    // stap 1: checken of het display-elementblok al bestaat 
    if (!$('div#dialog_filmdata').length) {
        // de filmdatabox en appendage bestaan nog niet
        
        // stap 1a: background-element
        var bgDiv = document.createElement('div');
        bgDiv.setAttribute('id', 'dialog_filmdata');
        $('body').append(bgDiv);
        var bgDiv = $('div#dialog_filmdata');
        bgDiv.css({
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '1000',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#000',
            opacity: '0.5'
        });

        // stap 1b: infobox-element
        var infoBox = document.createElement('div');
        infoBox.setAttribute('id', 'dialog_infobox');
        $('body').append(infoBox);
        var infoBox = $('div#dialog_infobox');
        infoBox.css({
            position: 'fixed',
            top: '20vh',
            left: '20vw',
            zIndex: '1001',
            margin: 'auto',
            width: '60vw',
            minHeight: '200px',
            opacity: '1.0',
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '10px'
        });
    } else {
        // filmdata en infobox bestaan, dus mogen nu getoond worden (verbergen = aangeroepen door sluitfunctie)
        $('div#dialog_filmdata').show();
        $('div#dialog_infobox').show();
    }
    
    // stap 2: invullen html voor infobox
    var infoHTML = "";
    infoHTML += "<img style='float: left; margin-right: 20px; margin-bottom: 10px;' src='" + filmObject.img + "' title='" + filmObject.titel + "'><h2 style='margin-top: 0'>" + filmObject.titel + "</h2>";
    infoHTML += "<p><b>" + filmObject.regisseur + " (" + filmObject.jaar + ")</b></p>";
    infoHTML += "<p>" + filmObject.acteurs + "</p>";
    infoHTML += "<p style='margin-top: 12px'>\"" + filmObject.plot + "\"</p>";
    infoHTML += "<p style='margin-top: 12px'><a href='http://www.imdb.com/title/" + filmObject.filmid + "' target='_blank'>Meer informatie op IMDB</a></p>";
    infoHTML += "<p style='clear: both; text-align: center; background-color: #ddd; padding: 10px; border-radius: 0 0 10px 10px; margin: 0;'><a id='boxClose' href='#'>Sluiten</a></p>";
    $('div#dialog_infobox').html(infoHTML);
    
    // epiloog: eventhandler om infobox te sluiten
    $('a#boxClose').on("click", function(e){
        e.preventDefault();
        // hier worden de gemaakte elementen gehide
        $('div#dialog_filmdata').hide();
        $('div#dialog_infobox').hide();
    });

}
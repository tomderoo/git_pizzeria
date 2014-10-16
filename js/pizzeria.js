/* 
 * Verzameling JQuery / Javascript
 */

jQuery.extend({
    postJSON: function(url,data,callback){
        return jQuery.post(url,data,callback,"json");
    }
});

/* * * * * GLOBALS / VARS * * * * */

var klant = {
    "id": null,
    "anaam": "",
    "vnaam": "",
    "email": "",
    "straat": "",
    "huisnr": "",
    "busnr": "",
    "postcode": "",
    "gemeente": "",
    "telefoon": ""
};

var mandje = {
    "klant_id": klant.id,              // klant_id
    "bestelling": [],            // array van bestellijnen
    "besteldatum": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "leverdatum": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "klant_opmerking": ""
};

var pizzalijstPromo = null;

var pizzalijstAll = null;

/* * * * * AUTOLOADS * * * * */

$(function(){
    
    /*** GLOBAL ELEMENTS ***/
    var $eLinkSuggesties = $('#link_suggesties');
    var $eLinkAanbod = $('#link_aanbod');
    var $eLinkMandjeBekijk = $('#bekijk_mandje');
    var $eLinkMandjeLedig = $('#ledig_mandje');
    var $eLinkUitloggen = $('#klant_actie_uit a');
    var $eLinkAanmelden = $('#klant_actie_in a');
    var $eSpace_Commerce = $('article#commerce');
    var $eSpace_Interact = $('article#interact');
    var $eSpace_Mandje = $('article#mandje');
    var $eSpace_User = $('article#user');
    
    //localStorage.clear();     // Debug functie: resetten van localStorage
    //sessionStorage.clear();   // Debug functie: resetten van sessionStorage
    //
    // check klant
    if (!sessionStorage.klant) {
        console.log("Klant bestaat niet => lege klant");
    } else {
        console.log("Klant bestaat al => opvullen");
        var retrievedklant = sessionStorage.klant;
        klant = JSON.parse(retrievedklant);
        console.log(klant);
    }
    visueelKlant();
    herkenEmail();
    
    // mandje sessie
    if(!localStorage.mandje) {
        console.log("localMandje bestaat niet => maken");
        localStorage.mandje = JSON.stringify(mandje);
    } else {
        console.log("localMandje bestaat wel => inladen");
        var retrievedmandje = localStorage.mandje;
        mandje = JSON.parse(retrievedmandje);
    };
    
    // verbind klant met mandje
    setMandje(klant.id);
    
    // update het mandje
    visueelMandje();
    
    // invisible info / error / interactie
    $('#error').hide();
    $('#info').hide();
    $('#interactie').hide();
    
    /* * * PIZZALIJST * * */
    vindPizzasPromo();
    //$eSpace_Commerce.soloFocus();
    
    /* * * USER FORMS * * */
    $('#form_aanmelden').validate({
        rules: {
            Uz44r: {
                required: true,
                email: true
            },
            P455w0r6: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            Uz44r: "Vul een geldig emailadres in",
            P455w0r6: "Vul een paswoord in (min. 8 karakters)"
        },
        submitHandler: function(form){
            console.log("Form-aanmelden: gedrukt op submit");
            var formdata = $('#form_aanmelden').serializeArray();
            herkenEmail(formdata[1].value); // email tonen
            loginKlant(formdata[1].value, formdata[2].value);
            console.log("Nu de eerste checkBestel na func loginKlant()");
            checkBestelSubmitMogelijk();
        }
    });
    
    $('#form_registreren').validate({
        rules: {
            Uz44r: {
                required: true,
                email: true
            },
            P455w0r6: {
                required: true,
                minlength: 8
            },
            vnaam: "required",
            anaam: "required",
            telefoon: {
                required: true,
                digits: true,
                minlength: 7
            },
            straat: "required",
            huisnr: "required",
            gemeente: "required",
            postcode: "required"
        },
        messages: {
            Uz44r: "Vul een geldig emailadres in",
            P455w0r6: "Vul een paswoord in (min. 8 karakters)",
            vnaam: "Verplicht veld",
            anaam: "Verplicht veld",
            telefoon: "Verplicht; minimaal 7 karakters, enkel cijfers",
            straat: "Verplicht veld",
            huisnr: "Verplicht veld",
            gemeente: "Verplicht veld",
            postcode: "Verplicht veld"
        },
        submitHandler: function(form) {
            console.log("Form-registreren: gedrukt op submit");
            var formdata = $('#form_registreren').serializeArray();
            console.log(formdata);
            registreerKlant(formdata);
        }
    });
    
    // - mandje bestellen
    $.datepicker.setDefaults($.datepicker.regional['nl-BE']);
    
    $('#input_leverdatum').datepicker({
        dateFormat: "yy-mm-dd",
        maxDate: "+2w",
        minDate: "+0d"
    });
    
    $.timepicker.regional['nl-BE'] = { // nl-BE regiosettings, zelf toegevoegd
            currentText: 'Huidige tijd',
            closeText: 'Kies',
            amNames: ['AM', 'A'],
            pmNames: ['PM', 'P'],
            timeFormat: 'HH:mm',
            timeSuffix: '',
            timeOnlyTitle: 'Kies tijd',
            timeText: 'Tijd',
            hourText: 'Uur',
            minuteText: 'Minuut',
            secondText: 'Seconde',
            millisecText: 'Milliseconde',
            microsecText: 'Microseconde',
            timezoneText: 'Tijdzone',
            isRTL: false
    };

    $.timepicker.setDefaults($.timepicker.regional['nl-BE']);
    
    $('#input_levertijd').timepicker();
    
    checkBestelSubmitMogelijk();
    
    $('#formbestellen_aanmelden').on("click", function(e){
        e.preventDefault();
        $eSpace_User.soloFocus();
    });
    
    $('form#form_mandjebestellen').validate({
        rules: {
            leverdatum: {
                required: true
            },
            levertijd: {
                required: true
            },
            opmerkingen: {
                required: false
            }
        },
        messages: {
            leverdatum: "Vul een geldige datum in (max. 14 dagen van nu)",
            levertijd: "Vul de gewenste levertijd in (onder voorbehoud van drukte)"
        },
        submitHandler: function(form) {
            //console.log("Form-bestellen: gedrukt op submit"); // DEBUG
            var formdata = $('#form_mandjebestellen').serializeArray();
            //console.log(formdata);    // DEBUG
            mandje.besteldatum = new Date().toISOString().slice(0, 19).replace('T', ' ');
            var sLevertijd = formdata[1].value + ' ' + formdata[2].value + ':00';
            mandje.leverdatum = sLevertijd;
            mandje.klant_opmerking = formdata[3].value;
            //console.log(mandje); // DEBUG
            bevestigMandje();
        }
    });
    
    /* * * EVENT HANDLERS * * */
        
        // - LINK Suggesties
        $eLinkSuggesties.on("click", function(e){
            e.preventDefault();
            vindPizzasPromo();
            $eSpace_Commerce.soloFocus();
        });
        
        // - LINK Volledig aanbod
        $eLinkAanbod.on("click", function(e){
            e.preventDefault();
            vindPizzasAll();
            $eSpace_Commerce.soloFocus();
        });
        
        // - Bekijk mandje
        $eLinkMandjeBekijk.on("click", function(e){
            e.preventDefault();
            $eSpace_Mandje.soloFocus();
            //console.log(mandje);  // DEBUG
            //console.log(klant):   // DEBUG
        });
        
        // - Ledig mandje
        $eLinkMandjeLedig.on("click", function(e){
            e.preventDefault();
            ledigMandje();
            $eSpace_Commerce.soloFocus();
        });
        
        // - Aanmelden / registreren
        $eLinkAanmelden.on("click", function(e){
            e.preventDefault();
            $eSpace_User.soloFocus();
        });
        
        // - Uitloggen
        $eLinkUitloggen.on("click", function(e){
            e.preventDefault();
            loguitKlant();
            checkBestelSubmitMogelijk();
        });
    
}); // einde doc ready

$(window).load(function(){
    
}); // einde window load

/* * * * * FUNCTIES * * * * */

// - solofocus
$.fn.soloFocus = function(){
    $('body article').not(this).hide(400); // not() om het huidige element uit te sluiten en zodoende een overbodige slide te vermijden
    this.show(400);
};

// - herken en herinner emailadres uit localStorage
function herkenEmail(email) {
    if (email) {
        localStorage.klant_email = email;
    };
    if(!localStorage.klant_email || localStorage.klant_email == null) {
        //console.log("localEmail bestaat niet");   // DEBUG
    } else {
        var retrievedemail = localStorage.klant_email;
        $('#form_aanmelden input[name="Uz44r"]').val(retrievedemail);
    };
}

/* * * FUNCTIES KLANTGEGEVENS * * */

// - login klantgegevens
function loginKlant(email, paswoord) {
    // JSON query om klant in te loggen
    var json_url = "jsonserver.php";
    var json_query = { act: "login_klant", email: email, paswoord: paswoord };
    $.post(json_url, json_query)
        .done(function(result){
            var foundklant = JSON.parse(result);
            if (foundklant == "NOUSER") {
                //console.log("Klant niet gevonden");   // DEBUG
                $('#interactie').hide();
                $('#info').hide();
                $('#error')
                        .html("<p>Deze klantnaam kon niet worden teruggevonden...</p>")
                        .attr("title", "Klik om te sluiten")
                        .css({ cursor: "pointer"})
                        .show()
                        .on("click", function(e){
                            e.preventDefault();
                            $('#user').soloFocus();
                        });
                $('#interact').soloFocus();
                return;
            }
            if (foundklant == "NOPASS") {
                //console.log("Fout paswoord"); // DEBUG
                $('#interactie').hide();
                $('#info').hide();
                $('#error')
                        .html("<p>Fout paswoord voor deze gebruiker, probeer opnieuw!</p>")
                        .attr("title", "Klik om te sluiten")
                        .css({ cursor: "pointer"})
                        .show()
                        .on("click", function(e){
                            e.preventDefault();
                            $('#user').soloFocus();
                        });
                $('#interact').soloFocus();
                return;
            }
            console.log("Klant gevonden:");
            console.log(foundklant);
            setKlant(foundklant.id, foundklant.anaam, foundklant.vnaam, foundklant.email, foundklant.straat, foundklant.huisnr, foundklant.busnr, foundklant.postcode, foundklant.gemeente, foundklant.telefoon);
            setMandje(parseInt(foundklant.id));
            visueelKlant();
            checkBestelSubmitMogelijk();
            $('#error').hide();
            $('#info').hide();
            $('#interactie')
                    .html("<p>Welkom, " + klant.vnaam + " " + klant.anaam + ", u bent succesvol ingelogd onder uw emailadres " + klant.email + "</p>")
                    .attr("title", "Klik om te sluiten")
                    .css({ cursor: "pointer"})
                    .show()
                    .on("click", function(e){
                        e.preventDefault();
                        $('#commerce').soloFocus();
                    });
            $('#interact').soloFocus();
        })
        .fail(function(result){
            console.log(result.statusText);
        });
}

// - uitloggen
function loguitKlant() {
    sessionStorage.removeItem('klant');
    klant.id = null;
    klant.anaam = "";
    klant.vnaam = "";
    klant.email = "";
    klant.straat = "";
    klant.huisnr = "";
    klant.busnr = "";
    klant.postcode = "";
    klant.gemeente = "";
    klant.telefoon = "";
    setMandje(klant.id);
    visueelKlant();
    checkBestelSubmitMogelijk();
}

// - registreer klant
function registreerKlant(formdata) {
    var str_klantdata = JSON.stringify(formdata);
    $.post("jsonserver.php", {act: "registreer_klant", klantdata: str_klantdata })
            .done(function(result){
                console.log(result);
            })
            .fail(function(result){
                console.log(result.statusText);
            });
}

// - zet de Klant-var
function setKlant(id, anaam, vnaam, email, straat, huisnr, busnr, postcode, gemeente, telefoon) {
    klant.id = id;
    klant.anaam = anaam;
    klant.vnaam = vnaam;
    klant.email = email;
    klant.straat = straat;
    klant.huisnr = huisnr;
    klant.busnr = busnr;
    klant.postcode = postcode;
    klant.gemeente = gemeente;
    klant.telefoon = telefoon;
    sessionStorage.klant = JSON.stringify(klant);
    console.log("De huidige klant:");
    console.log(klant);
    setMandje(klant.id);
};

// - integreer de Klant in het Mandje
function setMandje(klantid) {
    localStorage.mandje.klant_id = parseInt(klantid);
    mandje.klant_id = parseInt(klantid);
};

// - visuele update klantinfo
function visueelKlant() {
    if (klant.id === null) {
        $('#klant_actie_uit a').hide();
        $('#klant_actie_in a').show();
        $('#klant_identiteit').html("");
        $('#mandje_leveradres').html("").hide();
    } else {
        $('#klant_actie_in a').hide();
        $('#klant_actie_uit a').show();
        $('#klant_identiteit').html(klant.vnaam + " " + klant.anaam + " -");
        updateLeveradres();
    }
}

// - update het leveradres
function updateLeveradres() {
    console.log("Aanroep update leveradres");
    var sAdres = "";
    sAdres += klant.vnaam + " " + klant.anaam + "<br>";
    sAdres += klant.straat + " " + klant.huisnr;
    if (klant.busnr != "") {
        sAdres += " bus " + klant.busnr;
    }
    sAdres += "<br>" + klant.postcode + " " + klant.gemeente;
    $('#mandje_leveradres').html(sAdres).show();
}

/* * * FUNCTIES MANDJE * * */

// - voeg bestellijn toe aan Mandje
function bestellijnInMandje(pizzaobject, aantal) {
    var bProductReedsBesteld = false;
    var nu_prijs = 0;
    if (pizzaobject.promo_type != 0) {
        nu_prijs = pizzaobject.promo_prijs;
    } else {
        nu_prijs = pizzaobject.prijs;
    };
    var bestellijn = {
        "product_id" : pizzaobject.id,
        "naam" : pizzaobject.naam,
        "aantal" : parseInt(aantal),
        "prijs" : parseInt(nu_prijs)
    };
    console.log("Bestellijn: " + bestellijn);
    if (mandje.bestelling.length > 0) {
        for (var i = 0; i < mandje.bestelling.length; i++) {
            if (mandje.bestelling[i].product_id == bestellijn.product_id) {
                mandje.bestelling[i].aantal = parseInt(mandje.bestelling[i].aantal) + parseInt(bestellijn.aantal);
                bProductReedsBesteld = true;
            }
        }
    }
    if (false == bProductReedsBesteld) {
        mandje.bestelling.push(bestellijn);
    }
    visueelMandje();
}

// - ledig mandje
function ledigMandje() {
    mandje.bestelling = [];
    mandje.besteldatum = "";
    mandje.leverdatum = "";
    mandje.klant_opmerking = "";
    //$('#commerce').soloFocus();
    visueelMandje();
}

// - check bestel mogelijk 
function checkBestelSubmitMogelijk() {
    //console.log("checkBestel, klant id = " + mandje.klant_id);
    if (isNaN(mandje.klant_id) || null == mandje.klant_id) {
        $('#form_mandjebestellen').hide();
        $('#formbestellen_aanmelden').show();
    } else {
        $('#formbestellen_aanmelden').hide();
        $('#form_mandjebestellen').show();
    }
}

// - bevestig mandje
function bevestigMandje() {
    // JSON query om mandje te bestellen
    console.log(mandje);
    var str_mandje = JSON.stringify(mandje);
    $.post("jsonserver.php", {act: "bestel_mandje", mandje: str_mandje })
            .done(function(result){
                console.log(result);
                $('#error').hide();
                $('#info').hide();
                $('#interactie')
                        .html("<p>Uw bestelling werd succesvol ingevoerd, en zal op de voorziene datum geleverd worden!</p>")
                        .attr("title", "Klik om te sluiten")
                        .css({ cursor: "pointer"})
                        .show()
                        .on("click", function(e){
                            e.preventDefault();
                            $('#commerce').soloFocus();
                        });
                $('#interact').soloFocus();
                ledigMandje();
                visueelMandje();
            })
            .fail(function(result){
                console.log(result.statusText);
                $('#interactie').hide();
                $('#info').hide();
                $('#error')
                    .html("Er is iets misgegaan tijdens het doorsturen van uw bestelling, probeer opnieuw...")
                    .attr("title", "Klik om te sluiten")
                    .show()
                    .on("click", function(){
                        $('#mandje').soloFocus();
                    });
                $('#interact').soloFocus();
            });
}

// - visuele update van mandje
function visueelMandje() {
    console.log(mandje);
    // zoek element
    var mandjeBeeld = $('#mandje');
    // vind de variabelen prijs en aantal
    var nItems = 0;
    var nPrijs = 0;
    for (var i = 0; i < mandje.bestelling.length; i++) {
        nItems += parseInt(mandje.bestelling[i].aantal);
        nPrijs += parseInt(mandje.bestelling[i].aantal) * parseInt(mandje.bestelling[i].prijs);
    }
    // update de visuele informatie
    $('#mandje_aantal').html(nItems + " items");
    $('#mandje_euro').html(" (" + parseFloat(nPrijs/100).toFixed(2) + " &euro;)");
    if(nItems == 0) {
        $('#mandje_acties').hide();
    } else {
        $('#mandje_acties').show();
    }
    localStorage.mandje = JSON.stringify(mandje);
    // update het mandje-veld
    var eMandjelijst = $('<tbody>');
    var nTotaalbedrag = 0;
    for (var n = 0; n < mandje.bestelling.length; n++) {
        var pizzaAantal = mandje.bestelling[n].aantal;
        var pizzaNaam = mandje.bestelling[n].naam;
        var pizzaPrijs = mandje.bestelling[n].prijs;
        var pizzaSubtotaal = parseInt(pizzaAantal) * parseInt(pizzaPrijs);
        nTotaalbedrag += pizzaSubtotaal;
        var eMandjelijn = $('<tr>')
                //.attr("class", "mandjelijn")
                .appendTo(eMandjelijst);
        $('<td>')
                .attr("class", "mandjelijn_naam")
                .html(pizzaNaam)
                .appendTo(eMandjelijn);
        $('<td>')
                .attr("class", "mandjelijn_aantal")
                .html(pizzaAantal)
                .appendTo(eMandjelijn);
        $('<td>')
                .attr("class", "mandjelijn_prijs")
                .html('&euro; ' + parseFloat(pizzaSubtotaal / 100).toFixed(2))
                .appendTo(eMandjelijn);
        var eActie_Kill = $('<a>')
                .attr("data-lijnid", n)
                .attr("href", "#")
                .html("<img src='img/trashicon.png' height='24' width='24' alt='Verwijder' title='Verwijder'>")
                .on("click", function(e){
                    var thisId = $(this).attr("data-lijnid");
                    e.preventDefault();
                    mandje.bestelling.splice(thisId, 1);
                    if (mandje.bestelling.length < 1 || mandje.bestelling == null) {
                        $('#commerce').soloFocus();
                    }
                    visueelMandje();
                });
        var eActie_Plus = $('<a>')
                .attr("data-lijnid", n)
                .attr("href", "#")
                .html("<img src='img/plusbutton.png' alt='Plus 1' title='Plus 1'>")
                .on("click", function(e){
                    var thisId = $(this).attr("data-lijnid");
                    e.preventDefault();
                    mandje.bestelling[thisId].aantal = parseInt(mandje.bestelling[thisId].aantal) + 1;
                    visueelMandje();
                });
        var eActie_Min = $('<a>')
                .attr("data-lijnid", n)
                .attr("href", "#")
                .html("<img src='img/minbutton.png' alt='Min 1' title='Min 1'>")
                .on("click", function(e){
                    var thisId = $(this).attr("data-lijnid");
                    e.preventDefault();
                    mandje.bestelling[thisId].aantal = parseInt(mandje.bestelling[thisId].aantal) - 1;
                    if (mandje.bestelling[thisId].aantal < 1) {
                        mandje.bestelling.splice(thisId, 1);
                        if (mandje.bestelling.length < 1 || mandje.bestelling == null) {
                            $('#commerce').soloFocus();
                        }
                    }
                    visueelMandje();
                });
        $('<td>')
                .attr("class", "mandjelijn_acties")
                .append(eActie_Plus)
                .append(eActie_Min)
                .append(eActie_Kill)
                .appendTo(eMandjelijn);
    }
    var eSubtotaal = $('<tr>').addClass("mandje_totaal");
    eSubtotaal.append($('<td>').attr("colspan", "2").html("Subtotaal")).append($('<td>').html("&euro; " + parseFloat(nTotaalbedrag / 100).toFixed(2))).append($('<td>').html("&nbsp;"));
    $('#mandje_overzicht table tbody').remove();
    $('#mandje_overzicht table').append(eMandjelijst).append(eSubtotaal);
}

/* * * PIZZALIJST * * */

// - clear pizzalijst
function clearPizzalijst() {
    $('#pizzalijst_container').html("");
};

// - retrieve pizza's: ALL
function vindPizzasAll() {
    clearPizzalijst();
    if (pizzalijstAll != null) {
        for (var i = 0; i < pizzalijstAll.length; i++) {
            //console.log("Teruggave gevulde array: " + pizzalijstAll[i]); // debug: tonen eerste item in array
            toonPizza(pizzalijstAll[i]);
        }
    } else {
        // JSON query om pizzalijstAll te vullen
        var json_url = "jsonserver.php";
        var json_query = { act: "show_all" };
        $.post(
                json_url,
                json_query,
                function(json_data){
                    pizzalijstAll = json_data;
                    for (var i = 0; i < json_data.length; i++) {
                        console.log(json_data[i]); // debug: tonen eerste item in array
                        toonPizza(json_data[i]);
                    }
                }, 'json');
    }
};

// - retrieve pizza's: PROMO
function vindPizzasPromo() {
    clearPizzalijst();
    if (pizzalijstPromo != null) {
        for (var i = 0; i < pizzalijstPromo.length; i++) {
            //console.log("Teruggave gevulde array: " + pizzalijstPromo[i]); // debug: tonen eerste item in array
            toonPizza(pizzalijstPromo[i]);
        }
    } else {
        // JSON query om pizzalijstAll te vullen
        var json_url = "jsonserver.php";
        var json_query = { act: "show_promo" };
        $.post(
                json_url,
                json_query,
                function(json_data){
                    pizzalijstPromo = json_data;
                    for (var i = 0; i < json_data.length; i++) {
                        //console.log(json_data[i]); // debug: tonen eerste item in array
                        toonPizza(json_data[i]);
                    }
                }, 'json');
    }
};

// - toon pizza's
function toonPizza(pizzaobject) {
    var pizzaDiv = $('#pizzalijst_container');
    // de individuele pizzalijst
    var dezePizza = $('<div>')
            .attr("class", "pizzalijst_pizza clear")
            .appendTo(pizzaDiv);
    // de img div met img
    var imgDiv = $('<div>').addClass("pizza_imgdiv");
    $('<img>')
            .attr("src", "img/pizzas/pizza" + pizzaobject.id + ".png")
            .attr("alt", pizzaobject.naam)
            .attr("title", pizzaobject.naam + " - " + pizzaobject.omschrijving)
            .appendTo(imgDiv);
    // de tekst div met tekst
    var tekstDiv = $('<div>').addClass("pizza_tekstdiv");
    $('<h4>')
            .html(pizzaobject.naam)
            .appendTo(tekstDiv);
    $('<p>')
            .html(pizzaobject.omschrijving)
            .appendTo(tekstDiv);
    // checken of pizza in promo staat
    if (parseInt(pizzaobject.promo_type) == 1) {
        $('<p>')
                .html(pizzaobject.promo_tekst)
                .addClass("promo_chef")
                .appendTo(tekstDiv);
        dezePizza.addClass("promo_chef");
    };
    if (parseInt(pizzaobject.promo_type) == 2) {
        $('<p>')
                .html(pizzaobject.promo_tekst)
                .addClass("promo_seiz")
                .appendTo(tekstDiv);
        dezePizza.addClass("promo_seiz");
    };
    if (parseInt(pizzaobject.promo_type) == 3) {
        $('<p>')
                .html(pizzaobject.promo_tekst)
                .addClass("promo_tijd")
                .appendTo(tekstDiv);
        dezePizza.addClass("promo_tijd");
    };
    // prijs div met prijzen en button
    var prijsDiv = $('<div>').addClass("pizza_prijsdiv");
    $('<a>')
            .attr("class", "knop_inmandje")
            .attr("href", "#")
            .on("click", function(e){
                e.preventDefault();
                bestellijnInMandje(pizzaobject, 1);
    })
            .html("In mandje")
            
            .appendTo(prijsDiv).button();
    // prijs aanpassen aan promo
    if (parseInt(pizzaobject.promo_type) != 0) {
        var nuPrijs = parseFloat(pizzaobject.promo_prijs/100).toFixed(2);
        var oudPrijs = parseFloat(pizzaobject.prijs/100).toFixed(2);
        $('<p>').addClass("pizza_nuprijs").html("&euro; " + nuPrijs).appendTo(prijsDiv);
        $('<p>').addClass("pizza_oudprijs").html("&euro; " + oudPrijs).appendTo(prijsDiv);
    } else {
        var nuPrijs = parseFloat(pizzaobject.prijs/100).toFixed(2);
        $('<p>').addClass("pizza_nuprijs").html("&euro; " + nuPrijs).appendTo(prijsDiv);
    }
    
    tekstDiv.appendTo(dezePizza);
    imgDiv.appendTo(dezePizza);
    prijsDiv.appendTo(dezePizza);
};

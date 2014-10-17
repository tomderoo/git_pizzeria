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
    "leveradres": "",
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
    }
    console.log(klant); // DEBUG
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
    //console.log(mandje);    // DEBUG
    
    // verbind klant met mandje
    var sLeveradres = "";
    if (klant.adres != "" && klant.adres != undefined) {
        sLeveradres += klant.vnaam + " " + klant.anaam + "\n";
        sLeveradres += klant.straat + " " + klant.huisnr;
        if (klant.busnr != undefined && klant.busnr != "") {
            sLeveradres += " bus " + klant.busnr;
        }
        sLeveradres += "\n" + klant.postcode + " " + klant.gemeente;
    }
    setMandje(klant.id, sLeveradres);
    
    // update het mandje
    console.log("Update het mandje");   // DEBUG
    visueelMandje();
    
    // invisible info / error / interactie
    $('#error').hide();
    $('#info').hide();
    $('#interactie').hide();
    $('#tempmandje').hide();
    $('#user').hide();  //.tabs();
    $('#user #tab_accountnee').hide();
    /*if (mandje.bestelling.length > 0) {
        $('#tempmandje').show(400);
    };*/
    
    // zwevend mandje
    if(mandje.bestelling.length > 0) {
        $('#tempmandje_bestellen').show();
    };
    $('#tempmandje_bestellen').button().on("click", function(e){
        e.preventDefault();
        $('#tempmandje').toggle(400);
        $('article#mandje').soloFocus();
    })
    $('#tempmandje_sluiten').button().on("click", function(e){
        e.preventDefault();
        $('#tempmandje').toggle(400);
    });
    
    /* * * PIZZALIJST * * */
    vindPizzasPromo();
    //$eSpace_Commerce.soloFocus();
    
    /* * * USER FORMS * * */
    $('#formbestellen_submit').button();
    $('#formbestellen_aanmelden').button();
    $('#form_aanmelden input[type=submit]').button();
    $('#form_registersubmit').button();
    
    // - wel of niet account
    $('article#user h3 span a').on("click", function(e){
        e.preventDefault();
        $('#tab_accountja').toggle(400);
        $('#tab_accountnee').toggle(400);
    });
    
    // - aanmelden
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
    
    // - registreren
    
    $('#form_account_toggle').hide();
    
    $('#form_toggle').on("click", function(e){
        e.preventDefault();
        $('#form_account_toggle').toggle(400, function(){
            if( $(this).css("display") == "block") {
                $('#form_registersubmit').attr("value", "Account aanmaken");
                $('#form_toggle').html("Ik wil geen account maken, maar tijdelijke adresgegevens gebruiken");
                console.log("Toggled naar zichtbaar");
            }
            if( $(this).css("display") == "none") {
                $('#form_registersubmit').attr("value", "Tijdelijke adresgegevens gebruiken");
                $('#form_toggle').html("Ik wil ineens een account maken");
                console.log("Toggled naar onzichtbaar");
            }
        });
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
        // - hover mandje
        //$eLinkMandjeBekijk.hover(function(){$('section#tempmandje').show(400)}, function(){$('section#tempmandje').hide(400)});
        
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
    /*var defaults = { bVal: false };
    
    options = $.extend(defaults, options); // DAN MOET VAR "options" WORDEN INGESTELD IN function()

    if (options.bVal === true) {
        console.log("Het mandje wordt getoond en niet gehide");    // DEBUG
        
        $('body article').not(this).not($('article#tempmandje')).hide(400); // not() om het huidige element uit te sluiten en zodoende een overbodige slide te vermijden
    } else {
        console.log("Alles wordt gehide behalve het aangeroepene"); // DEBUG
        $('body article').not(this).hide(400);
    }*/
    //console.log(this); // DEBUG
    $('body article').not(this).hide(400);
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
            var sLeveradres = "";
            sLeveradres += foundklant.vnaam + " " + foundklant.anaam + "\n";
            sLeveradres += foundklant.straat + " " + foundklant.huisnr;
            if (foundklant.busnr != "") {
                sLeveradres += " bus " + foundklant.busnr;
            }
            sLeveradres += "\n" + foundklant.postcode + " " + foundklant.gemeente;
            setMandje(parseInt(foundklant.id), sLeveradres);
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
    setMandje(klant.id, "");
    visueelKlant();
    checkBestelSubmitMogelijk();
}

// - registreer klant
function registreerKlant(formdata) {
    console.log(formdata);  // DEBUG
    var formObject = {};
    $.each(formdata, function(index, value){
        formObject[value.name] = value.value;
        //console.log(value.name + " = " + value.value);    // DEBUG
    });
    console.log(formObject);    // DEBUG
    // - in geval van account maken
    if (formObject.Uz44r != "" && formObject.P455w0r6 != "") {
        // acount registratie gevraagd
        var str_klantdata = JSON.stringify(formdata);
        var klantUser = formObject.Uz44r;
        var klantPass = formObject.P455w0r6;
        $.post("jsonserver.php", {act: "registreer_klant", klantdata: str_klantdata })
                .done(function(result){
                    console.log(result);
                    var foundklant = JSON.parse(result);
                    if (foundklant == "BESTAAT") {
                        console.log("Klant bestaat reeds"); // DEBUG
                        console.log(formdata);  // DEBUG
                        $('#interactie').hide();
                        $('#info').hide();
                        $('#error')
                                .html("<p>Deze klant is reeds geregistreerd! U dient een andere combinatie van email en paswoord in te geven om een nieuwe account te registreren...</p>")
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
                    if (foundklant == "SUCCES") {
                        console.log("Succesvol aangemaakte klant"); // DEBUG
                        loginKlant(klantUser, klantPass);
                    }
                })
                .fail(function(result){
                    console.log(result.statusText);
                });

        
        
        
    } else {
        // gewoon adresgegevens in tijdelijke klant zetten
        console.log("Tijdelijke klant");    // DEBUG
        setKlant(0, formObject.anaam, formObject.vnaam, "", formObject.straat, formObject.huisnr, formObject.busnr, formObject.postcode, formObject.gemeente, formObject.telefoon);
        visueelKlant();
        updateLeveradres();
        checkBestelSubmitMogelijk();
        $('#error').hide();
        $('#info').hide();
        $('#interactie')
                .html("<p>U hebt tijdelijke adresgegevens ingevoerd; u kan nu uw bestelling vervolledigen.</p>")
                .attr("title", "Klik om te sluiten")
                .css({ cursor: "pointer"})
                .show()
                .on("click", function(e){
                    e.preventDefault();
                    $('#commerce').soloFocus();
                });
        $('#interact').soloFocus();
    }
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
    var sLeveradres = "";
    if (straat != "" && straat != undefined) {
        sLeveradres += vnaam + " " + anaam + "\n";
        sLeveradres += straat + " " + huisnr;
        if (busnr != "" && busnr != undefined) {
            sLeveradres += " bus " + busnr;
        }
        sLeveradres += "\n" + postcode + " " + gemeente;
    }
    sessionStorage.klant = JSON.stringify(klant);
    console.log("De huidige klant teruggevonden via setKlant:");
    console.log(klant);
    setMandje(klant.id, sLeveradres);
};

// - integreer de Klant in het Mandje
function setMandje(klantid, leveradres) {
   localStorage.mandje.klant_id = parseInt(klantid);
    localStorage.mandje.leveradres = leveradres;
    mandje.klant_id = parseInt(klantid);
    mandje.leveradres = leveradres;
};

// - visuele update klantinfo
function visueelKlant() {
    if (klant.id === null || isNaN(klant.id)) {
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
    if (klant.straat != "" && klant.straat != undefined) {
        var sAdres = "";
        sAdres += klant.vnaam + " " + klant.anaam + "<br>";
        sAdres += klant.straat + " " + klant.huisnr;
        if (klant.busnr != "") {
            sAdres += " bus " + klant.busnr;
        }
        sAdres += "<br>" + klant.postcode + " " + klant.gemeente;
        $('#mandje_leveradres').html(sAdres).show();
    }
}

/* * * FUNCTIES MANDJE * * */

// - naar afrekenmodus
function naarAfrekenMandje() {
    $('article#mandje').soloFocus();
    /*if ($('#mandje_leveradres').text() !== "") {
        $('#mandje_leveradres').show(400);
    }*/
    $('#mandje_afrekenfunctie').hide(400);
    $('#mandje_bestelfunctie').show(400);
};

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
    //console.log(bestellijn);  // DEBUG
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
    if (isNaN(mandje.klant_id) || null === mandje.klant_id) {
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
        $('article#tempmandje').hide(400);  // aanpassen van tempmandje
        $('#tempmandje_bestellen').hide();  // tempmandje bestelbutton
    } else {
        $('#mandje_acties').show();
        $('article#tempmandje').show(400);  // aanpassen van tempmandje
        $('#tempmandje_bestellen').show();  // tempmandje bestelbutton
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
    var eMandjelijstKloon = eMandjelijst.clone(true);
    var eSubtotaalKloon = eSubtotaal.clone(true);
    $('#mandje_overzicht table tbody').remove();
    $('#mandje_overzicht table').append(eMandjelijst).append(eSubtotaal);
    // update het tempmandje
    $('#tempmandje_overzicht table tbody').remove();
    $('#tempmandje_overzicht table').append(eMandjelijstKloon).append(eSubtotaalKloon);
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
                        //console.log(json_data[i]); // debug: tonen eerste item in array
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
            
            .appendTo(prijsDiv)
            .button()
            /*.hover(
            function(){
                $('section#tempmandje').show(400)
            },
            function(){
                $('section#tempmandje').hide(400)
            })*/;
    $('<a>')
            .addClass("knop_mandje")
            .attr("href", "#")
            .on("click", function(e){
                e.preventDefault();
                $('section#tempmandje').toggle(400);
    })
            .html("<img src='img/basket20x.png' alt='Mandje' title='Mandje'>")
            /*.hover(
            function(){
                $(this).html("Toon");
            },
            function(){
                $(this).html("<img src='img/basket20x.png' alt='Mandje' title='Mandje'>");
            })*/
            .appendTo(prijsDiv);
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

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
    "telefoon": "",
    "status": 0
};

var mandje = {
    "klant_id": klant.id,              // klant_id
    "bestelling": [],            // array van bestellijnen
    "besteldatum": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "leverdatum": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "leveradres": "",
    "klant_opmerking": ""
};

var pizzalijstVolledig = null;

var pizzalijstPromo = null;

var pizzalijstAll = null;

var reactiesAll = null;

/* * * * * AUTOLOADS * * * * */

$(function(){
    
    /*** GLOBAL ELEMENTS ***/
    var $eLinkSuggesties = $('#link_suggesties');
    var $eLinkAanbod = $('#link_aanbod');
    var $eLinkBusiness = $('#link_business');
    var $eLinkMandjeBekijk = $('#bekijk_mandje');
    var $eLinkMandjeLedig = $('#ledig_mandje');
    var $eLinkUitloggen = $('#klant_actie_uit a');
    var $eLinkAanmelden = $('#klant_actie_in a');
    var $eSpace_Commerce = $('article#commerce');
    var $eSpace_Business = $('article#business');
    var $eSpace_Interact = $('article#interact');
    var $eSpace_Mandje = $('article#mandje');
    var $eSpace_User = $('article#user');
    
    /* * * PIZZALIJST volledig laten zien * * */
    vulPizzalijst();
    
    /* * * STORAGE KLANT EN MANDJE * * */
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
    if (klant.straat != "" && klant.straat != undefined) {
        sLeveradres += klant.vnaam + " " + klant.anaam + "\n";
        sLeveradres += klant.straat + " " + klant.huisnr;
        if (klant.busnr != undefined && klant.busnr != "") {
            sLeveradres += " bus " + klant.busnr;
        }
        sLeveradres += "\n" + klant.postcode + " " + klant.gemeente;
    }
    setMandje(klant.id, sLeveradres);
    
    /* * * TOON PIZZAS OP PAGINA * * */
    vindPizzasPromo();
    //$eSpace_Commerce.soloFocus();
    
    /* * * VISUEEL update het mandje * * */
    console.log("Update het mandje");   // DEBUG
    visueelMandje();
    
    // invisible info / error / interactie
    $('#error').hide();
    $('#info').hide();
    $('#interactie').hide();
    $('#tempmandje').hide();
    $('#business').hide();
    $('#user').hide();  //.tabs();
    $('#user #tab_accountnee').hide();
    
    /* * * ZWEVEND MANDJE * * */
    // onderstaande is vanwege bugs verplaatst naar de window-load (zie aldaar)
    /*$('#tempmandje')
            .css({ cursor: "move" })
            .draggable({
                containment: "window"
    });*/
    // - variabele knop
    if(mandje.bestelling.length > 0) {
        $('#tempmandje_bestellen').show();
    };
    // - eventhandlers voor activatie en verwijdering
    $('#mandjefuncs img').css({ cursor: "pointer" }).on("click", function(){
        $('#tempmandje').toggle(400);
    });
    $('#tempmandje_bestellen').button().on("click", function(e){
        e.preventDefault();
        $('#tempmandje').toggle(400);
        $('article#mandje').soloFocus();
    });
    $('#tempmandje_sluiten').button().on("click", function(e){
        e.preventDefault();
        $('#tempmandje').toggle(400);
    });
    
    /* * * OVER ONS - bedrijfspagina met reacties * * */
    vulReactielijst();
    
    zetTopReactie();
    
    zetBusinessRuimte();

    $('#reactieveld_ingelogd').hide();
    $('#reactieveld_nietingelogd').show();
    if (klant.id != null && klant.id != 0) {
        reactieveldToggle();
    }
    
    lockoutCheck();
    
    $('#reactie_plaatsen').button().on("click", function(e){
        e.preventDefault();
        bevestigReactie();
    });
    $('#reactie_login').button().on("click", function(e){
        e.preventDefault();
        $('#user').soloFocus();
    });
    
    /* * * USER FORMS * * */
    $('#formbestellen_submit').button();
    $('#formbestellen_aanmelden').button();
    $('#form_aanmelden input[type=submit]').button();
    $('#form_registersubmit').button();
    
    // - validator uitbreiden met checkPostcode
    jQuery.validator.addMethod("validPostcode", function(value, element){
        var sGemeentewaarde = value;
        var aToegelatenGemeenten = [    // Voorbeeld-array...
            2000, 2010, 2020, 2030, 2040, 2050, 2100, 2170, 2140
        ];
        for (var i = 0; i < aToegelatenGemeenten.length; i++) {
            if (sGemeentewaarde == aToegelatenGemeenten[i]) {
                return true;
            }
        };
        return false;
    }, "In deze postcode wordt niet geleverd, kies een andere gemeente");
    
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
            postcode: {
                required: true,
                validPostcode: true
            }
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
            postcode: {
                required: "Verplicht veld",
                validPostcode: "In deze postcode wordt niet geleverd..."
            }
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
    
    // mogelijkheid tot adresverandering => toggle van invoerveld
    $('a#adresbevestiger').hide();
    $('#form_adreswijziger').hide();
    
    $('a#adreswijziger').on("click", function(e){
        console.log("Geklikt op adreswijziger");    // DEBUG
        e.preventDefault();
        $('div#mandje_adresveld').hide();
        var sHuidigAdres = $('div#mandje_adresveld').html();
        console.log(sHuidigAdres);
        var aAdresGegevens = sHuidigAdres.split("<br>");
        console.log(aAdresGegevens);
        var sNaamVoornaam = aAdresGegevens[0];
        var sStraat = aAdresGegevens[1];
        var sPostcodeGemeente = aAdresGegevens[2];
        var nFirstSpace = sPostcodeGemeente.indexOf(" ");
        var sPostcode = sPostcodeGemeente.substr(0, nFirstSpace);
        var sGemeente = sPostcodeGemeente.substr((nFirstSpace)+1, sPostcodeGemeente.length-1);
        console.log("Naam en voornaam: " + sNaamVoornaam);
        console.log("Straatgegevens: " + sStraat);
        console.log("Postcode: " + sPostcode);
        console.log("Gemeente: " + sGemeente);
        var sLnAdres = sHuidigAdres.replace(/<br>/g, "\n");
        console.log(sLnAdres);
        $('input#form_adresw_naam').val(sNaamVoornaam);
        $('input#form_adresw_straat').val(sStraat);
        $('input#form_adresw_postcode')
                .val(sPostcode)
                .on("blur", function(){
                    $(this).css({ outline: "none" });
                    checkGemeente($(this));
        });
        $('input#form_adresw_gemeente').val(sGemeente);
        $('#form_adreswijziger').show();
        $("#form_mandjebestellen :input").prop("disabled", true);
        $(this).hide();
        $('a#adresbevestiger').show();
    });
    
    $('a#adresbevestiger').on("click", function(e){
        console.log("Geklikt op bevestigen adres"); // DEBUG
        e.preventDefault();
        var sNaamVoornaam = $('input#form_adresw_naam').val();
        var sStraat = $('input#form_adresw_straat').val();
        var sPostcode = $('input#form_adresw_postcode').val();
        var sGemeente = $('input#form_adresw_gemeente').val();
        var sNieuwAdres = sNaamVoornaam + "\n" + sStraat + "\n" + sPostcode + " " + sGemeente;
        console.log(sNieuwAdres);
        mandje.leveradres = sNieuwAdres;
        var sNieuwBrAdres = sNieuwAdres.replace(/\n/g, "<br>");
        console.log(sNieuwBrAdres);
        $('div#mandje_adresveld').html(sNieuwBrAdres).show();
        $('div#form_adreswijziger').hide();
        $("#form_mandjebestellen :input").prop("disabled", false);
        $(this).hide();
        $('a#adreswijziger').show();
        console.log("Nieuwe inhoud mandje:");   // DEBUG
        console.log(mandje);    // DEBUG
    });
    
    /* * * EVENT HANDLERS algemeen * * */
        
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
        
        // - LINK Business
        $eLinkBusiness.on("click", function(e){
            e.preventDefault();
            lockoutCheck();
            vulReactielijst();
            zetBusinessRuimte();
            $eSpace_Business.soloFocus();
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
    /* * * TEMPMANDJE DRAGGABLE * * */
    // hier omdat er anders de mogelijkheid is van een bug die "position: relative" toevoegt rechtstreeks in
    // de style. De bug manifesteert zich als draggable() wordt ingesteld en de DOM nog niet volledig is
    // geladen... Er is nog altijd wel de mogelijkheid dat het een Chrome-only issue is vanwege het gebruik
    // van de parameter "containment". Om zeker te zijn definiëren we position-fixed nog eens expliciet na
    // de aanroep...
    $('#tempmandje').draggable({ containment: "window" });
    $('#tempmandje').css({ position: "fixed", cursor: "move"});
    
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
            setKlant(foundklant.id, foundklant.anaam, foundklant.vnaam, foundklant.email, foundklant.straat, foundklant.huisnr, foundklant.busnr, foundklant.postcode, foundklant.gemeente, foundklant.telefoon, foundklant.status);
            var sLeveradres = "";
            sLeveradres += foundklant.vnaam + " " + foundklant.anaam + "\n";
            sLeveradres += foundklant.straat + " " + foundklant.huisnr;
            if (foundklant.busnr != "") {
                sLeveradres += " bus " + foundklant.busnr;
            }
            sLeveradres += "\n" + foundklant.postcode + " " + foundklant.gemeente;
            setMandje(parseInt(foundklant.id), sLeveradres);
            visueelKlant();
            visueelMandje();
            vindPizzasPromo();
            checkBestelSubmitMogelijk();
            reactieveldToggle();
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
    klant.status = 0;
    setMandje(klant.id, "");
    vindPizzasPromo();
    visueelMandje();
    visueelKlant();
    checkBestelSubmitMogelijk();
    reactieveldToggle();
}

// - registreer klant
function registreerKlant(formdata) {
    //console.log(formdata);  // DEBUG
    var formObject = {};
    $.each(formdata, function(index, value){
        formObject[value.name] = value.value;
        //console.log(value.name + " = " + value.value);    // DEBUG
    });
    //console.log(formObject);    // DEBUG
    // - in geval van account maken
    if (formObject.Uz44r != "" && formObject.P455w0r6 != "") {
        // acount registratie gevraagd
        var str_klantdata = JSON.stringify(formdata);
        var klantUser = formObject.Uz44r;
        var klantPass = formObject.P455w0r6;
        $.post("jsonserver.php", {act: "registreer_klant", klantdata: str_klantdata })
                .done(function(result){
                    //console.log(result);  // DEBUG
                    var foundklant = JSON.parse(result);
                    if (foundklant == "BESTAAT") {
                        //console.log("Klant bestaat reeds"); // DEBUG
                        //console.log(formdata);  // DEBUG
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
                        //console.log("Succesvol aangemaakte klant"); // DEBUG
                        loginKlant(klantUser, klantPass);
                    }
                })
                .fail(function(result){
                    //console.log("Registreer -> gefaald"); // DEBUG
                    //console.log(result.statusText); // DEBUG
                    $('#interactie').hide();
                    $('#info').hide();
                    $('#error')
                            .html("<p>Registratie mislukt! Probeer opnieuw...</p>")
                            .attr("title", "Klik om te sluiten")
                            .css({ cursor: "pointer"})
                            .show()
                            .on("click", function(e){
                                e.preventDefault();
                                $('#user').soloFocus();
                            });
                    $('#interact').soloFocus();
                });

        
        
        
    } else {
        // gewoon adresgegevens in tijdelijke klant zetten
        //console.log("Tijdelijke klant");    // DEBUG
        setKlant(0, formObject.anaam, formObject.vnaam, "", formObject.straat, formObject.huisnr, formObject.busnr, formObject.postcode, formObject.gemeente, formObject.telefoon, 0);
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
function setKlant(id, anaam, vnaam, email, straat, huisnr, busnr, postcode, gemeente, telefoon, status) {
    klant.id = parseInt(id);
    klant.anaam = anaam;
    klant.vnaam = vnaam;
    klant.email = email;
    klant.straat = straat;
    klant.huisnr = huisnr;
    klant.busnr = busnr;
    klant.postcode = postcode;
    klant.gemeente = gemeente;
    klant.telefoon = telefoon;
    klant.status = parseInt(status);
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
    //console.log("De huidige klant teruggevonden via setKlant:");  // DEBUG
    //console.log(klant);                                           // DEBUG
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
        $('#mandje_adresveld').html("");
        $('#mandje_leveradres').hide();
    } else {
        $('#klant_actie_in a').hide();
        $('#klant_actie_uit a').show();
        $('#klant_identiteit').html(klant.vnaam + " " + klant.anaam + " -");
        updateLeveradres();
    }
}

// - update het leveradres
function updateLeveradres() {
    //console.log("Aanroep update leveradres"); // DEBUG
    if (klant.straat != "" && klant.straat != undefined) {
        var sAdres = "";
        sAdres += klant.vnaam + " " + klant.anaam + "<br>";
        sAdres += klant.straat + " " + klant.huisnr;
        if (klant.busnr != "") {
            sAdres += " bus " + klant.busnr;
        }
        sAdres += "<br>" + klant.postcode + " " + klant.gemeente;
        $('#mandje_adresveld').html(sAdres);
        $('#mandje_leveradres').show();
    }
}

// - check of de gemeente beleverd kan worden
function checkGemeente(eInput) {
    var sGemeentewaarde = eInput.val();
    var aToegelatenGemeenten = [
        2000, 2010, 2020, 2030, 2040, 2050, 2100, 2170, 2140
    ];
    var bGoedeGemeente = false;
    for (var i = 0; i < aToegelatenGemeenten.length; i++) {
        if (sGemeentewaarde == aToegelatenGemeenten[i]) {
            bGoedeGemeente = true;
        }
    };
    if (false == bGoedeGemeente) {
        alert("In deze gemeente kan niet geleverd worden! Kies een andere gemeente...");
        eInput.css({ outline: "1px dotted red" }).focus();
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
    if ((pizzaobject.promo_type != 0 && pizzaobject.promo_type != 4) || (pizzaobject.promo_type == 4 && klant.status > 0)) {
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
    //console.log(mandje);  // DEBUG
    var str_mandje = JSON.stringify(mandje);
    $.post("jsonserver.php", {act: "bestel_mandje", mandje: str_mandje })
            .done(function(result){
                //console.log(result);  // DEBUG
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
                //console.log(result.statusText);   // DEBUG
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
    //console.log("Mandje voor statuscheck"); // DEBUG
    //console.log(mandje);    // DEBUG
    // check klantstatus en zet prijzen in mandje bestellijnen navenant
    for (var i = 0; i < mandje.bestelling.length; i++) {
        var pizzalijnPID = mandje.bestelling[i].product_id;
        for (var j = 0; j < pizzalijstVolledig.length; j++) {
            var pizzalijstPID = pizzalijstVolledig[j].id;
            if (pizzalijnPID == pizzalijstPID) {
                if (parseInt(pizzalijstVolledig[j].promo_type) == 4) {
                    if (klant.status > 0) {
                        mandje.bestelling[i].prijs = parseInt(pizzalijstVolledig[j].promo_prijs);
                    } else {
                        mandje.bestelling[i].prijs = parseInt(pizzalijstVolledig[j].prijs);
                    }
                }
            }
        }
    }
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
    // klantlevel checken voor korting
    if (klant.status > 0) {
        var nKlantKorting = parseInt(klant.status) * 2.5;
        var nKortingBedrag = Math.round(nTotaalbedrag * nKlantKorting / 100);
        //var nKortingTotaalbedrag = nTotaalbedrag * (100 - nKlantKorting) / 100; // effectieve bereking maakt round-errors
        var nKortingTotaalbedrag = parseFloat(nTotaalbedrag) - parseFloat(nKortingBedrag);
        var eKorting = $('<tr>').addClass("mandje_korting enkelkorting");
        eKorting.append($('<td>').attr("colspan", "2").html("Klantkorting " + parseFloat(nKlantKorting).toFixed(2) + " %")).append($('<td>').html("&euro; " + parseFloat(nKortingBedrag / 100).toFixed(2) + " -")).append($('<td>').html("&nbsp;"));
        var eNieuwTotaalBedrag = $('<tr>').addClass("mandje_totaal enkelkorting");
        eNieuwTotaalBedrag.append($('<td>').attr("colspan", "2").html("Eindtotaal")).append($('<td>').html("&euro; " + parseFloat(nKortingTotaalbedrag / 100).toFixed(2))).append($('<td>').html("&nbsp;"));
        var eKortingKloon = eKorting.clone(true);
        var eNieuwTotaalBedragKloon = eNieuwTotaalBedrag.clone(true);
        $('#mandje_overzicht table').append(eKorting).append(eNieuwTotaalBedrag);
        $('#tempmandje_overzicht table').append(eKortingKloon).append(eNieuwTotaalBedragKloon);
    } else {
        verwijderKlantkorting();
    };
    
}

// - verwijder klantkorting
function verwijderKlantkorting() {
    if ($('.enkelkorting').length > 0) {
        $('.enkelkorting').remove();
    }
}

/* * * PIZZALIJST * * */

// - clear pizzalijst
function clearPizzalijst() {
    $('#pizzalijst_container').html("");
};

// - vul pizzalijst met alle pizza's
function vulPizzalijst() {
    // JSON query om pizzalijstAll te vullen
    var json_url = "jsonserver.php";
    var json_query = { act: "show_all" };
    /*$.post(
            json_url,
            json_query,
            function(json_data){
                console.log(json_data); // DEBUG
                pizzalijstVolledig = json_data;
            }, 'json');*/
    // bovenstaande call is asynchroon, en we moeten een synchrone hebben, dus:
    pizzalijstVolledig = JSON.parse(
            $.ajax({
                type: "POST",
                url: json_url,
                data: json_query,
                async: false
            }).responseText);
    // pizzalijst sorteren
    pizzalijstVolledig.sort(function(a, b){
        return (parseInt(a.prijs) - parseInt(b.prijs));
    });
    //console.log(pizzalijstVolledig);  // DEBUG
}

// - retrieve pizza's: ALL
function vindPizzasAll() {
    clearPizzalijst();
    if (pizzalijstVolledig != null) {
        var pizzaAllLijst = pizzalijstVolledig.sort(function(a, b){
            return (parseInt(a.prijs) - parseInt(b.prijs));
        });
        for (var i = 0; i < pizzaAllLijst.length; i++) {
            //console.log("Teruggave gevulde array: " + pizzalijstAll[i]); // DEBUG: tonen eerste item in array
            toonPizza(pizzaAllLijst[i]);
        }
    } else {
        // JSON query om pizzalijstAll te vullen / OUDE MANIER, NU INACTIEF
        /*var json_url = "jsonserver.php";
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
                }, 'json');*/
        //vulPizzalijst();
        //vindPizzasAll();
    }
};

// - retrieve pizza's: PROMO
function vindPizzasPromo() {
    clearPizzalijst();
    if (pizzalijstVolledig != null) {
        var pizzaPromoLijst = pizzalijstVolledig.sort(function(a, b){
            return (parseInt(b.promo_type) - parseInt(a.promo_type));
        });
        for (var i = 0; i < pizzaPromoLijst.length; i++) {
            //console.log("Teruggave gevulde array: " + pizzalijstPromo[i]); // debug: tonen eerste item in array
            var nPizzaPromotype = parseInt(pizzaPromoLijst[i].promo_type);
            if (nPizzaPromotype > 0 && nPizzaPromotype != 4) {
                toonPizza(pizzaPromoLijst[i]);
            }
            if (nPizzaPromotype == 4 && klant.status > 0) {
                toonPizza(pizzaPromoLijst[i]);
            }
        }
    } else {
        // JSON query om pizzalijstAll te vullen / OUDE MANIER, NU INACTIEF
        /*var json_url = "jsonserver.php";
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
                }, 'json');*/
        //vulPizzalijst();
        //vindPizzasPromo();
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
    if (parseInt(pizzaobject.promo_type) == 4 && klant.status > 0) {
        $('<p>')
                .html("Speciaal geselecteerd voor jou, " + klant.vnaam + " " + klant.anaam + "!")
                .addClass("promo_klant")
                .appendTo(tekstDiv);
        dezePizza.addClass("promo_klant");
    }
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
    $('<a>')
            .addClass("knop_mandje")
            .attr("href", "#")
            .on("click", function(e){
                e.preventDefault();
                $('section#tempmandje').toggle(400);
    })
            .html("<img src='img/basket20x.png' alt='Mandje' title='Mandje'>")
            .appendTo(prijsDiv);
    // prijs aanpassen aan promo
    if ((parseInt(pizzaobject.promo_type) != 0 && parseInt(pizzaobject.promo_type) != 4) || parseInt(pizzaobject.promo_type) == 4 && klant.status > 0) {
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

/* * * REACTIES * * */

// - vult de reactielijst
function vulReactielijst() {
    // JSON query om reactiesAll te vullen
    //console.log("Er is een aanroep om de reactielijst te vullen");  // DEBUG
    var json_url = "jsonserver.php";
    var json_query = { act: "show_reacties" };
    // we moeten een synchrone call hebben om de lijst te vullen bij laden (normaal: via PHP!), dus:
    reactiesAll = JSON.parse(
            $.ajax({
                type: "POST",
                url: json_url,
                data: json_query,
                async: false
            }).responseText);
    //console.log(reactiesAll); // DEBUG
};

// - zoekt een klant op basis van id
function vindKlant(klantid) {
    // JSON query om klant te vinden
    var json_url = "jsonserver.php";
    var json_query = { act: "vind_klant", klant_id: klantid };
    var deKlant = JSON.parse(
            $.ajax({
                type: "POST",
                url: json_url,
                data: json_query,
                async: false
            }).responseText);
    //console.log(deKlant);     // DEBUG
    return deKlant;
}

// - plaatst de visuele topreactie bovenaan pagina op basis van reactielijst
function zetTopReactie() {
    var nReactieId = parseInt(reactiesAll[0].klant_id);
    var sReactieTekst = reactiesAll[0].reactie;
    var oDeKlant = vindKlant(nReactieId);
    //console.log(oDeKlant);   // DEBUG
    var sKlantNaam = oDeKlant.vnaam;
    var sKlantGemeente = oDeKlant.gemeente;
    $('#floatreactie_tekst')
            .append($('<p>').html("\"" + sReactieTekst + "\""))
            .append($('<p>').html("- " + sKlantNaam + ", " + sKlantGemeente));
}

// - vormt de businessruimte op basis van de reactielijst
function zetBusinessRuimte() {
    var eReactielijst = $("#reactielijst");
    eReactielijst.html(""); // eerst legen, nodig wegens pogingen tot herhaalde aanroep
    for (var i = 0; i < reactiesAll.length; i++) {
        var eReactieP = $('<p>');
        var nReactieId = parseInt(reactiesAll[i].klant_id);
        var sReactieTekst = reactiesAll[i].reactie;
        var oDeKlant = vindKlant(nReactieId);
        var sKlantNaam = oDeKlant.vnaam;
        var sKlantGemeente = oDeKlant.gemeente;
        eReactieP.html("<b>" + oDeKlant.vnaam + " uit " + oDeKlant.gemeente + "</b><br>\"" + sReactieTekst + "\"").appendTo(eReactielijst);
    };
}

// - switcht de zichtbaarheid van de reactievelden al naargelang user-login
function reactieveldToggle() {
    if (klant.id != null & klant.id != 0) {
        $('#reactieinterface h4').html("Zelf een reactie plaatsen, " + klant.vnaam + "?");
    } else {
        $('#reactieinterface h4').html("Zelf een reactie plaatsen?");
    }
    //console.log("Lockout-item: " + localStorage.getItem('lockout'));  // DEBUG
    if (localStorage.getItem('lockout') !== null) {
        //console.log("ReactieveldToggle zegt dat lockout bestaat");  // DEBUG
        $('#reactieveld_ingelogd').hide();
        $('#reactieveld_nietingelogd').hide();
        $('#lockoutbericht').show();
    } else {
        //console.log("ReactieveldToggle zegt dat lockout niet bestaat");   // DEBUG
        $('#reactieveld_ingelogd').toggle();
        $('#reactieveld_nietingelogd').toggle();
        $('#lockoutbericht').hide();
    }
};

// - indienen van reactie
function bevestigReactie() {
    // checken of er invoer is
    $('#reactie_tekst').css({ outline: "none" });
    if ($('#reactie_tekst').val() == "") {
        alert("Gelieve een tekst in te vullen");
        $('#reactie_tekst').css({ outline: "1px dotted red" }).focus();
        return;
    }
    //console.log($('#reactie_tekst').val()); // DEBUG
    var sInvoerTekst = $('#reactie_tekst').val();
    sInvoerTekst = sInvoerTekst.replace(/\n/g, " ").replace(/[^a-zA-Z 0-9'":;.!,&]+/g, "");
    //console.log(sInvoerTekst);  // DEBUG
    $('#reactie_tekst').val(sInvoerTekst);
    // invoer doorsturen naar database
    var str_reactie = sInvoerTekst;
    var klant_id = parseInt(klant.id);
    $.post("jsonserver.php", {act: "plaats_reactie", reactie: str_reactie, klant_id: klant_id })
            .done(function(result){
                //console.log(result);    // DEBUG
                $('#error').hide();
                $('#info').hide();
                $('#interactie')
                        .html("<p>Uw reactie werd geplaatst, dank!</p>")
                        .attr("title", "Klik om te sluiten")
                        .css({ cursor: "pointer"})
                        .show()
                        .on("click", function(e){
                            e.preventDefault();
                            $('#business').soloFocus();
                        });
                $('#interact').soloFocus();
                vulReactielijst();
                zetBusinessRuimte();
                lockoutReactie();
            })
            .fail(function(result){
                //console.log(result.statusText);
                $('#interactie').hide();
                $('#info').hide();
                $('#error')
                    .html("Er is iets misgegaan tijdens het doorsturen van uw reactie, probeer opnieuw...")
                    .attr("title", "Klik om te sluiten")
                    .show()
                    .on("click", function(){
                        $('#business').soloFocus();
                    });
                $('#interact').soloFocus();
            });
}

// - na het plaatsen van een reactie moet die user voor een bepaalde tijd locked out worden om spam tegen te gaan
function lockoutReactie() {
    var nuTijd = new Date().getTime();
    if(localStorage.lockout) {
        // er is al een lockout aangeroepen geweest op deze computer
        //console.log("lockoutReactie-> er is al lockout");  // DEBUG
        lockoutCheck();
    } else {
        // er is nog geen lockout aangeroepen geweest, dus net een reactie geplaatst
        localStorage.setItem('lockout', nuTijd);
        lockoutReactie();
    }
}

// - kijken of lockout nog geldig is
function lockoutCheck() {
    var nuTijd = new Date().getTime();
    //console.log("The time is Now -> " + nuTijd);  // DEBUG
    if(localStorage.lockout) {
        // er is een lockout aangeroepen geweest op deze computer
        //console.log("lockoutCheck-> er is lockout var aanwezig: " + localStorage.lockout);  // DEBUG
        if (parseInt(localStorage.lockout) + 5*60*1000 < nuTijd) {
            //console.log("lockoutCheck-> de lockout is verlopen");  // DEBUG
            // verberg lockoutbericht
            $('#lockoutbericht').hide();
            // verwijder lockout
            localStorage.removeItem('lockout');
            $('#reactieveld_ingelogd').hide();
            $('#reactieveld_nietingelogd').show();
            if (klant.id != null && klant.id != 0) {
                reactieveldToggle();
            }
        } else {
            //console.log("lockoutCheck-> de lockout is nog geldig");  // DEBUG
            // verberg reactiemogelijkheid tot timeout
            $('#reactieveld_ingelogd').hide();
            $('#reactieveld_nietingelogd').hide();
            $('#lockoutbericht').show();
        }
    } else {
        // er is geen lockout aanwezig
        $('#lockoutbericht').hide();
        $('#reactieveld_ingelogd').hide();
        $('#reactieveld_nietingelogd').show();
        if (klant.id != null && klant.id != 0) {
            reactieveldToggle();
        }
    }
}
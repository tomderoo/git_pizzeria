/* 
 * Verzameling JQuery / Javascript
 */

jQuery.extend(
{
postJSON: function(url,data,callback)
{
return jQuery.post(url,data,callback,"json");
}
});

/* * * * * GLOBALS / VARS * * * * */

var klant = {
    "id": null,
    "anaam": "",
    "vnaam": "",
    "email": ""
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
            // form.preventDefault();
            // form.submit();
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
    $('#input_leverdatum').datepicker({
        dateFormat: "yy-mm-dd",
        maxDate: "+2w",
        minDate: "+0d"
    });
    
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
            console.log("Form-bestellen: gedrukt op submit");
            var formdata = $('#form_mandjebestellen').serializeArray();
            console.log(formdata);
            mandje.besteldatum = new Date().toISOString().slice(0, 19).replace('T', ' ');
            var sLevertijd = formdata[1].value + ' ' + formdata[2].value + ':00';
            mandje.leverdatum = sLevertijd;
            mandje.klant_opmerking = formdata[3].value;
            console.log(mandje);
            bevestigMandje();
        }
    });
    
    /* * * EVENT HANDLERS * * */
        
        // - LINK Suggesties
        $eLinkSuggesties.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK suggesties");
            vindPizzasPromo();
            $eSpace_Commerce.soloFocus();
        });
        
        // - LINK Volledig aanbod
        $eLinkAanbod.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK aanbod");
            vindPizzasAll();
            $eSpace_Commerce.soloFocus();
        });
        
        // - Bekijk mandje
        $eLinkMandjeBekijk.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op bekijk mandje");
            $eSpace_Mandje.soloFocus();
            console.log(mandje);
        });
        
        // - Ledig mandje
        $eLinkMandjeLedig.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op ledig mandje");
            ledigMandje();
            $eSpace_Commerce.soloFocus();
        });
        
        // - Aanmelden / registreren
        $eLinkAanmelden.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op aanmelden/registreren");
            $eSpace_User.soloFocus();
        });
        
        // - Uitloggen
        $eLinkUitloggen.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op uitloggen");
            loguitKlant();
            console.log("CheckBestel na loguitKlant aanklikken");
            checkBestelSubmitMogelijk();
        });
    
}); // einde doc ready

$(window).load(function(){
    
}); // einde window load

/* * * * * FUNCTIES * * * * */

// - tempscherm // DIT WERKT NIET NAAR BEHOREN - WAAROM? (Vertoont dubbel laden, geeft niet alle attr door, etc.)

$.fn.maakTempScherm = function(){
    var eThis = this;
    eThis
            .attr("title", "Klik om te sluiten")
            .soloFocus()
            .on("click", function(){
                $('#commerce').soloFocus();
            });
};

// - solofocus
$.fn.soloFocus = function(){
    $('body article').not(this).hide(400); // not() om het huidige element uit te sluiten en zodoende een overbodige slide te vermijden
    this.show(400);
};

// - login klantgegevens
function loginKlant(email, paswoord) {
    // JSON query om klant in te loggen
    var json_url = "jsonserver.php";
    var json_query = { act: "login_klant", email: email, paswoord: paswoord };
    $.post(json_url, json_query)
        .done(function(result){
            var foundklant = JSON.parse(result);
            setKlant(foundklant.id, foundklant.anaam, foundklant.vnaam, foundklant.email);
            setMandje(parseInt(foundklant.id));
            visueelKlant();
            checkBestelSubmitMogelijk();
            $('#interactie')
                    .html("Welkom, " + klant.vnaam + " " + klant.anaam + ", u bent succesvol ingelogd onder uw emailadres " + klant.email)
                    .attr("title", "Klik om te sluiten")
                    .show()
                    .on("click", function(){
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
    setKlant(klant.id);
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
function setKlant(id, anaam, vnaam, email) {
    klant.id = id;
    klant.anaam = anaam;
    klant.vnaam = vnaam;
    klant.email = email;
    sessionStorage.klant = JSON.stringify(klant);
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
    } else {
        $('#klant_actie_in a').hide();
        $('#klant_actie_uit a').show();
        $('#klant_identiteit').html(klant.vnaam + " " + klant.anaam + " -");
    }
}

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
    //$('#commerce').soloFocus();
    visueelMandje();
}

// - check bestel mogelijk 
function checkBestelSubmitMogelijk() {
    //console.log("checkBestel, klant id = " + mandje.klant_id);
    if (isNaN(mandje.klant_id) || null == mandje.klant_id) {
        $('#formbestellen_submit').hide();
        $('#formbestellen_aanmelden').show();
    } else {
        $('#formbestellen_aanmelden').hide();
        $('#formbestellen_submit').show();
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
                $('#interactie')
                        .html("<p>Uw bestelling werd succesvol ingevoerd, en zal op de voorziene datum geleverd worden!</p>")
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
    var eMandjelijst = $('<ul>');
    for (var n = 0; n < mandje.bestelling.length; n++) {
        $('<li>')
                .html(mandje.bestelling[n].aantal + ' x ' + mandje.bestelling[n].naam + ' - &euro; ' + parseFloat(parseInt(mandje.bestelling[n].aantal) * parseInt(mandje.bestelling[n].prijs) / 100).toFixed(2))
                .appendTo(eMandjelijst);
    }
    $('div#mandje_overzicht').html(eMandjelijst);
}

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
                        console.log(json_data[i]); // debug: tonen eerste item in array
                        toonPizza(json_data[i]);
                    }
                }, 'json');
    }
};

// - toon pizza's
function toonPizza(pizzaobject) {
    var pizzaDiv = $('#pizzalijst_container');
    var dezePizza = $('<div>')
            .attr("class", "pizzalijst_pizza clear")
            .appendTo(pizzaDiv);
    $('<img>')
            .attr("src", "img/pizzas/pizza" + pizzaobject.id + ".png")
            .attr("alt", pizzaobject.naam)
            .attr("title", pizzaobject.naam + " - " + pizzaobject.omschrijving)
            .css({ float: "left" })
            .appendTo(dezePizza);
    $('<h4>')
            .html(pizzaobject.naam)
            .appendTo(dezePizza);
    $('<p>')
            .html(pizzaobject.omschrijving)
            .appendTo(dezePizza);
    if (parseInt(pizzaobject.promo_type) != 0) {
        $('<p>')
                .html("<em><b>Promo:</b> " + pizzaobject.promo_tekst + "</em>")
                .appendTo(dezePizza);
    };
    $('<a>')
            .attr("class", "knop_inmandje")
            .attr("href", "#")
            .on("click", function(e){
                e.preventDefault();
                bestellijnInMandje(pizzaobject, 1);
    })
            .html("In mandje")
            
            .appendTo(dezePizza).button();
};

function herkenEmail(email) {
    if (email) {
        localStorage.klant_email = email;
    };
    if(!localStorage.klant_email || localStorage.klant_email == null) {
        console.log("localEmail bestaat niet");
    } else {
        var retrievedemail = localStorage.klant_email;
        $('#form_aanmelden input[name="Uz44r"]').val(retrievedemail);
    };
}
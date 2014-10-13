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
    
    //localStorage.clear();
    //sessionStorage.clear();
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
    $eSpace_Commerce.soloFocus();
    
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
    
    /* * * EVENT HANDLERS * * */
        
        // - LINK Suggesties
        $eLinkSuggesties.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK suggesties");
            $eSpace_Commerce.soloFocus();
            clearPizzalijst();
            vindPizzasPromo();
        });
        
        // - LINK Volledig aanbod
        $eLinkAanbod.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK aanbod");
            $eSpace_Commerce.soloFocus();
            clearPizzalijst();
            vindPizzasAll();
        });
        
        // - Bekijk mandje
        $eLinkMandjeBekijk.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op bekijk mandje");
            $eSpace_Mandje.maakTempScherm();
            $eSpace_Mandje.soloFocus();
            //bevestigMandje();
        });
        
        // - Ledig mandje
        $eLinkMandjeLedig.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op ledig mandje");
            ledigMandje();
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
        });
    
}); // einde doc ready

$(window).load(function(){
    
}); // einde window load

/* * * * * FUNCTIES * * * * */

// - tempscherm

$.fn.maakTempScherm = function(){
    var eThis = this;
    eThis
            //.attr("title", "Klik om te sluiten")
            //.soloFocus()
            .show()
            .on("click", function(){
                $('#commerce').soloFocus();
            });
};

// - solofocus
$.fn.soloFocus = function(){
    $('body article').hide(400);
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
            visueelKlant();
            $('#interactie')
                    .html("Welkom, " + klant.vnaam + " " + klant.anaam + ", u bent succesvol ingelogd onder uw emailadres " + klant.email)
                    .maakTempScherm();
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
    visueelKlant();
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
    visueelMandje();
}

// - bevestig mandje
function bevestigMandje() {
    // JSON query om mandje te bestellen
    console.log(mandje);
    var str_mandje = JSON.stringify(mandje);
    $.post("jsonserver.php", {act: "bestel_mandje", mandje: str_mandje })
            .done(function(result){
                console.log(result);
            })
            .fail(function(result){
                console.log(result.statusText);
            });;
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
}

// - retrieve pizza's: ALL
function vindPizzasAll() {
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

// - clear pizzalijst
function clearPizzalijst() {
    $('#pizzalijst_container').html("");
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
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
    "id": "",
    "anaam": "",
    "vnaam": "",
    "email": ""
};

var mandje = {
    "klant_id": 1,              // klant_id
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
    
    //localStorage.clear();
    // mandje sessie
    if(!localStorage.mandje) {
        console.log("localMandje bestaat niet => maken");
        localStorage.mandje = JSON.stringify(mandje);
    } else {
        console.log("localMandje bestaat wel => inladen");
        retrievedmandje = localStorage.mandje;
        mandje = JSON.parse(retrievedmandje);
    };
    
    // update het mandje
    visueelMandje();
    
    // check klant
    // - IF klant anoniem
    visueelKlant();
    
    // invisible info / error / interactie
    $('#error').hide();
    $('#info').hide();
    $('#interactie').hide();
    
    /* * * PIZZALIJST * * */
    vindPizzasPromo();
    
    /* * * EVENT HANDLERS * * */
        
        // - LINK Suggesties
        $eLinkSuggesties.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK suggesties");
            clearPizzalijst();
            vindPizzasPromo();
        });
        
        // - LINK Volledig aanbod
        $eLinkAanbod.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op LINK aanbod");
            clearPizzalijst();
            vindPizzasAll();
        });
        
        // - Bekijk mandje
        $eLinkMandjeBekijk.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op bekijk mandje");
            bevestigMandje();
        });
        
        // - Ledig mandje
        $eLinkMandjeLedig.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op ledig mandje");
            ledigMandje();
        });
        /*
        // - Aanmelden / registreren
        $eLinkAanmelden.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op aanmelden/registreren");
        });
        */
        // - Uitloggen
        $eLinkUitloggen.on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op uitloggen");
        });
    
}); // einde doc ready

$(window).load(function(){
    
}); // einde window load

/* * * * * FUNCTIES * * * * */

// - login klantgegevens
function loginKlant(email, paswoord) {
    // JSON query om klant in te loggen
        var json_url = "jsonserver.php";
        var json_query = { show: "klant", email: email, paswoord: paswoord };
        $.post(
                json_url,
                json_query,
                function(json_data){
                    var dezeKlant = json_data;
                    for (var i = 0; i < json_data.length; i++) {
                        console.log(json_data[i]); // debug: tonen eerste item in array
                        toonPizza(json_data[i]);
                    }
                }, 'json');
}

// - zet de Klant-var
function setKlant(id, anaam, vnaam, email) {
    klant.id = id;
    klant.anaam = anaam;
    klant.vnaam = vnaam;
    klant.email = email;
    setMandje(klant);
};

// - integreer de Klant in het Mandje
function setMandje(klant) {
    localStorage.mandje.klant = klant;
};

// - visuele update klantinfo
function visueelKlant() {
    if (klant.id == "") {
        $('#klant_actie_uit a').hide();
    } else {
        $('#klant_actie_in a').hide();
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
    // JSON query om klant in te loggen
    /*var json_url = "jsonserver.php";
    var json_mandje = mandje;
    var json_query = { show: "bestel", mandje: json_mandje };
    console.log(json_query);
    $.postJSON(json_url, json_query)
            .done(function(result){
                console.log(result);
            })
            .fail(function(result){
                console.log(result.statusText);
            });*/
    console.log(mandje);
    var str_mandje = JSON.stringify(mandje);
    $.post("jsonserver.php", {show: "bestel", mandje: str_mandje })
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
            console.log("Teruggave gevulde array: " + pizzalijstAll[i]); // debug: tonen eerste item in array
            toonPizza(pizzalijstAll[i]);
        }
    } else {
        // JSON query om pizzalijstAll te vullen
        var json_url = "jsonserver.php";
        var json_query = { show: "all" };
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
            console.log("Teruggave gevulde array: " + pizzalijstPromo[i]); // debug: tonen eerste item in array
            toonPizza(pizzalijstPromo[i]);
        }
    } else {
        // JSON query om pizzalijstAll te vullen
        var json_url = "jsonserver.php";
        var json_query = { show: "promo" };
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
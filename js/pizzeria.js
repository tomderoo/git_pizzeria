/* 
 * Verzameling JQuery / Javascript
 */

/* * * * * GLOBALS / VARS * * * * */

var klant = {
    "id": "",
    "anaam": "",
    "vnaam": "",
    "email": ""
};

var mandje = {
    "klant_id": "",              // klant-id
    "bestelling": [],            // array van bestellijnen
    "besteldatum": "",
    "leverdatum": "",
    "klant_opmerking": ""
};

/* * * * * AUTOLOADS * * * * */

$(function(){
    // update het mandje
    visueelMandje();
    
    // invisible info / error
    $('#error').hide();
    $('#info').hide();
    
    /* * * PIZZALIJST * * */
    var json_url = "jsonserver.php";
    var json_query = { show: "all" };
    $.getJSON(
            json_url,
            json_query,
            function(json_data){
                for (var i = 0; i < json_data.length; i++) {
                    console.log(json_data[i]); // debug: tonen eerste item in array
                    toonPizza(json_data[i]);
                }
            });
    
    /* * * EVENT HANDLERS * * */
    
        // - Bekijk mandje
        $('#bekijk_mandje').on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op bekijk mandje");
        });
        
        // - Ledig mandje
        $('#ledig_mandje').on("click", function(e){
            e.preventDefault();
            console.log("Geklikt op ledig mandje");
        });
    
}); // einde doc ready

$(window).load(function(){
    
}); // einde window load

/* * * * * FUNCTIES * * * * */

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
    mandje.klant = klant;
};

// - voeg bestellijn toe aan Mandje
function bestellijnInMandje(bestellijn) {
    var bProductReedsBesteld = false;
    if (mandje.bestelling.length > 0) {
        for (var i = 0; i < mandje.bestelling.length; i++) {
            if (mandje.bestelling[i].product_id == bestellijn.product_id) {
                mandje.bestelling[i].aantal = parseInt(mandje.bestelling[i].aantal) + parseInt(bestellijn.aantal);
                bProductReedsBesteld = true;
                return true;
            }
        }
    }
    if (false == bProductReedsBesteld) {
        mandje.bestelling.push(bestellijn);
        return true;
    }
    return false;
}

// - visuele update van mandje
function visueelMandje() {
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
    // NOG DOEN
}

// - toon pizzalijst
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
};
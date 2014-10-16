<?php
if (!$_POST["act"]) {
    header("location: index.php");
}

use resource\Service\PizzaService;
use Doctrine\Common\ClassLoader;
//use stdClass;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

$service = new PizzaService();

switch ($_POST["act"]) {
    case "show_all":
        try {
            $producten = $service->geefAlleProducten();
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten = "VOID";
        }
        //print_r($producten);
        $array = (array) $producten;
        echo(json_encode($array));
        break;

    case "show_promo":
        try {
            $producten = json_encode($service->geefAllePromotieProducten());
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten= json_encode("VOID");
        }
        echo($producten);
        break;
    
    case "login_klant":
        $email = $_POST["email"];
        $paswoord = $_POST["paswoord"];
        try {
            $klant = $service->loginKlant($email, $paswoord);
        } catch (resource\Exception\KlantNietGevondenException $ex) {
            echo json_encode("NOUSER");
            break;
        } catch (resource\Exception\FoutPaswoordException $ex) {
            echo json_encode("NOPASS");
            break;
        }
        echo(json_encode($klant));
        break;
    
    case "registreer_klant":
        $klantdata = json_decode($_POST["klantdata"]);
        //echo json_encode("Klantdata: " . $klantdata);
        $anaam = $klantdata[3]->value;
        $vnaam = $klantdata[2]->value;
        $email = $klantdata[0]->value;
        $paswoord = $klantdata[1]->value;
        $telefoon = $klantdata[4]->value;
        $straat = $klantdata[5]->value;
        $huisnr = $klantdata[6]->value;
        $busnr = $klantdata[7]->value;
        $gemeente = $klantdata[8]->value;
        $postcode = $klantdata[9]->value;
        $status = 0;
        $info = "";
        try {
            $service->nieuweKlant($anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info);
            echo("Succes");
        } catch (resource\Exception\FouteInvoerException $ex) {
            echo json_encode("Klant bestaat reeds");
        }
        break;
    
    case "bestel_mandje":
        $mandje = json_decode($_POST["mandje"]);
        if($service->bevestigMandje($mandje)) {
            echo(json_encode(1));
        } else {
            echo(json_encode(0));
        }
        break;

    default:
        try {
            $producten = json_encode($service->geefAllePromotieProducten());
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten= json_encode("VOID");
        }
        echo($producten);
        break;
}

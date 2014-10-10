<?php
if (!$_POST["show"]) {
    header("location: index.php");
}

use resource\Service\PizzaService;
use Doctrine\Common\ClassLoader;
//use stdClass;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

$service = new PizzaService();

switch ($_POST["show"]) {
    case "all":
        try {
            $producten = $service->geefAlleProducten();
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten = "VOID";
        }
        //print_r($producten);
        $array = (array) $producten;
        echo(json_encode($array));
        break;

    case "promo":
        try {
            $producten = json_encode($service->geefAllePromotieProducten());
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten= json_encode("VOID");
        }
        echo($producten);
        break;
    
    case "klant":
        $email = $_POST["email"];
        $paswoord = $_POST["paswoord"];
        try {
            $klant = $service->loginKlant($email, $paswoord);
        } catch (resource\Exception\KlantNietGevondenException $ex) {
            echo json_encode($error);
            break;
        } catch (resource\Exception\FoutPaswoordException $ex) {
            echo json_encode($error);
            break;
        }
        echo json_encode($klant);
        break;
    
    case "bestel":
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

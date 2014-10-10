<?php
if (!$_GET["show"]) {
    header("location: index.php");
}

use resource\Service\PizzaService;
use Doctrine\Common\ClassLoader;
//use stdClass;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

$service = new PizzaService();

switch ($_GET["show"]) {
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

    default:
        try {
            $producten = json_encode($service->geefAllePromotieProducten());
        } catch (resource\Exception\OnvindbaarException $ex) {
            $producten= json_encode("VOID");
        }
        echo($producten);
        break;
}

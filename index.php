<?php
use resource\Service\PizzaService;
use Doctrine\Common\ClassLoader;
//use stdClass;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

session_start();

$service = new PizzaService();

require_once("libraries/Twig/Autoloader.php");
    
Twig_Autoloader::register();
    
$loader = new Twig_Loader_Filesystem("src/resource/Presentation");
$twig = new Twig_Environment($loader);
    
// twigvars (voor doorgave aan framework)
$twigvars = array(
    "timer" => null,
    "klant" => null,
);

// klant overbrengen
/*if (isset($_SESSION["klant"])) {
    $twigvars["klant"] = $_SESSION["klant"];
} else {
    $twigvars["klant"] = new stdClass();
}*/

$twigvars["timer"] = $service->ScriptTimer();

$view = $twig->render("Pizzeria.twig", $twigvars);
print($view);
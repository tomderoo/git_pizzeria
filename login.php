<?php
use resource\Service\PizzaService;
use Doctrine\Common\ClassLoader;
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
    "klant" => "anoniem",
);

$twigvars["timer"] = $service->ScriptTimer();

$view = $twig->render("Login.twig", $twigvars);
print($view);
<?php
namespace resource\Entities;

use \stdClass;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class Promotype {
    
    private $promotype;
    
    public function getAsArray() {
        $promotypes = array(
            0 => "Niet in promotie",
            1 => "Suggestie van de chef",
            2 => "Seizoenssuggestie",
            3 => "Tijdelijke korting",
            4 => "Klantafhankelijke korting"
        );
        return $promotypes;
    }
    
}

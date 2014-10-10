<?php

namespace resource\Data;

use resource\Entities\Mandje;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class MandjeDAO {
    
    public function create($klant, $bestelling) {
        $bestelmandje = new Mandje($klant, $bestelling);
        return $bestelmandje;
    }
}
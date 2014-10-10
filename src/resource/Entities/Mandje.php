<?php

namespace resource\Entities;

class Mandje {
    
    private $klant;
    private $bestelling = array();
    
    public function __construct($klant, $bestelling) {
        $this->klant = $klant;
        $this->bestelling = $bestelling;
    }
    
    public function getBestelling() {
        return $this->bestelling;
    }
    
    public function setBestelling($array) {
        $this->bestelling = $array;
    }
    
    public function getKlant() {
        return $this->klant;
    }
    
    public function setKlant($value) {
        $this->klant = $value;
    }
}
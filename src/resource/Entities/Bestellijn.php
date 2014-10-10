<?php

namespace resource\Entities;

class Bestellijn {
    
    private $id;
    private $bestelling_id;
    private $product_id;
    private $aantal;
    private $prijs_hist;
    
    public function __construct($id, $bestelling_id, $product_id, $aantal, $prijs_hist) {
        $this->id = $id;
        $this->bestelling_id = $bestelling_id;
        $this->product_id = $product_id;
        $this->aantal = $aantal;
        $this->prijs_hist = $prijs_hist;
    }
    
    public static function create($id, $bestelling_id, $product_id, $aantal, $prijs_hist) {
        $lijn = new Bestellijn($id, $bestelling_id, $product_id, $aantal, $prijs_hist);
        return $lijn;
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getBestellingId() {
        return $this->bestelling_id;
    }
    
    public function getProductId() {
        return $this->product_id;
    }
    
    public function getAantal() {
        return $this->aantal;
    }
    
    public function getPrijsHist() {
        return $this->prijs_hist;
    }
}
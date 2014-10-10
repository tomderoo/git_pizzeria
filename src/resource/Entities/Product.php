<?php

namespace resource\Entities;

class Product {
    
    private static $idMap = array();
    
    // moet public zijn of json_encode vindt het niet...
    public $id;
    public $naam;
    public $omschrijving;
    public $prijs;
    public $promo_type;
    public $promo_tekst;
    public $promo_prijs;
    
    private function __construct($id, $naam, $omschrijving, $prijs, $promo_type, $promo_tekst, $promo_prijs) {
        $this->id = $id;
        $this->naam = $naam;
        $this->omschrijving = $omschrijving;
        $this->prijs = $prijs;
        $this->promo_type = $promo_type;
        $this->promo_tekst = $promo_tekst;
        $this->promo_prijs = $promo_prijs;
    }
    
    public static function create($id, $naam, $omschrijving, $prijs, $promo_type, $promo_tekst, $promo_prijs) {
        if (!isset(self::$idMap[$id])) {
            self::$idMap[$id] = new Product($id, $naam, $omschrijving, $prijs, $promo_type, $promo_tekst, $promo_prijs);
        }
        return self::$idMap[$id];
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getNaam() {
        return $this->naam;
    }
    
    public function getOmschrijving() {
        return $this->omschrijving;
    }
    
    public function getPrijs() {
        return $this->prijs;
    }
    
    public function getPromoType() {
        return $this->promo_type;
    }
    
    public function getPromoTekst() {
        return $this->promo_tekst;
    }
    
    public function getPromoPrijs() {
        return $this->promo_prijs;
    }
    
}
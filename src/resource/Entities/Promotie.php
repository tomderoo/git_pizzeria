<?php
/*
 * Deze entiteit bevat de gedachte van promoties als een status-layer bovenop bepaalde producten
 * Dientengevolge passen ze de variabele "prijs_hist" in de entiteit bestellijn aan, en NIET
 * de standaardprijs van de producten
 */

namespace resource\Entities;

class Promotie {
    
    private static $idMap = array();
    
    private $id;
    private $datum_start;
    private $datum_eind;
    private $product_id;
    private $promoprijs;
    private $omschrijving;
    private $promotype;     // verwijst naar array met vaste types promoties
    
    private function __construct($id, $datum_start, $datum_eind, $product_id, $promoprijs, $omschrijving, $promotype) {
        $this->id = $id;
        $this->datum_start = $datum_start;
        $this->datum_eind = $datum_eind;
        $this->product_id = $product_id;
        $this->promoprijs = $promoprijs;
        $this->omschrijving = $omschrijving;
        $this->promotype = $promotype;
    }
    
    public static function create($id, $datum_start, $datum_eind, $product_id, $promoprijs, $omschrijving, $promotype) {
        if (!isset(self::$idMap[$id])) {
            self::$idMap[$id] = new Promotie($id, $datum_start, $datum_eind, $product_id, $promoprijs, $omschrijving, $promotype);
        }
        return self::$idMap[$id];
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getDatumStart() {
        return $this->datum_start;
    }
    
    public function getDatumEind() {
        return $this->datum_eind;
    }
    
    public function getProductId() {
        return $this->product_id;
    }
    
    public function getPromoprijs() {
        return $this->promoprijs;
    }
    
    public function getOmschrijving() {
        return $this->omschrijving;
    }
    
    public function getPromotype() {
        return $this->promotype;
    }
    
}
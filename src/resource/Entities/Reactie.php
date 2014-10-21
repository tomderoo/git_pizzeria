<?php
/*
 * Deze entiteit verwijst naar klantenreacties
 */

namespace resource\Entities;

class Reactie {
    
    private static $idMap = array();
    
    public $id;
    public $klant_id;
    public $reactie;
    
    private function __construct($id, $klant_id, $reactie) {
        $this->id = $id;
        $this->klant_id = $klant_id;
        $this->reactie = $reactie;
    }
    
    public static function create($id, $klant_id, $reactie) {
        if (!isset(self::$idMap[$id])) {
            self::$idMap[$id] = new Reactie($id, $klant_id, $reactie);
        }
        return self::$idMap[$id];
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getKlantId() {
        return $this->klant_id;
    }
    
    public function getReactie() {
        return $this->reactie;
    }
    
}
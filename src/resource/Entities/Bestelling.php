<?php

namespace resource\Entities;

class Bestelling {
    
    private static $idMap = array();
    
    private $id;
    private $klant_id;
    private $besteldatum;
    private $leverdatum;
    private $koerier_brief;
    private $koerier_debrief;
    private $status;
    private $opmerking;
    
    private function __construct($id, $klant_id, $besteldatum, $leverdatum, $koerier_brief, $koerier_debrief, $status, $opmerking) {
        $this->id = $id;
        $this->klant_id = $klant_id;
        $this->besteldatum = $besteldatum;
        $this->leverdatum = $leverdatum;
        $this->koerier_brief = $koerier_brief;
        $this->koerier_debrief = $koerier_debrief;
        $this->status = $status;
        $this->opmerking = $opmerking;
    }
    
    public static function create($id, $klant_id, $besteldatum, $leverdatum, $koerier_brief, $koerier_debrief, $status, $opmerking) {
        if (!isset(self::$idMap[$id])) {
            self::$idMap[$id] = new Bestelling($id, $klant_id, $besteldatum, $leverdatum, $koerier_brief, $koerier_debrief, $status, $opmerking);
        }
        return self::$idMap[$id];
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getKlantId() {
        return $this->klant_id;
    }
    
    public function getBesteldatum() {
        return $this->besteldatum;
    }
    
    public function getLeverdatum() {
        return $this->leverdatum;
    }
    
    public function getKoerierBrief() {
        return $this->koerier_brief;
    }
    
    public function getKoerierDebrief() {
        return $this->koerier_debrief;
    }
    
    public function getStatus() {
        return $this->status;
    }
    
    public function getOpmerking() {
        return $this->opmerking;
    }
}
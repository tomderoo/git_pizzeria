<?php

namespace resource\Entities;

class Klant {
    
    public $id;
    public $anaam;
    public $vnaam;
    public $straat;
    public $huisnr;
    public $busnr;
    public $postcode;
    public $gemeente;
    public $telefoon;
    public $email;
    private $paswoord;
    public $status;
    public $info;
    
    private function __construct($id, $anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info) {
        $this->id = $id;
        $this->anaam = $anaam;
        $this->vnaam = $vnaam;
        $this->straat = $straat;
        $this->huisnr = $huisnr;
        $this->busnr = $busnr;
        $this->postcode = $postcode;
        $this->gemeente = $gemeente;
        $this->telefoon = $telefoon;
        $this->email = $email;
        $this->paswoord = $paswoord;
        $this->status = $status;
        $this->info = $info;
    }
    
    public static function create($id, $anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info) {
        $newKlant = new Klant($id, $anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info);
        return $newKlant;
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getAnaam() {
        return $this->anaam;
    }
    
    public function getVnaam() {
        return $this->vnaam;
    }
    
    public function getStraat() {
        return $this->straat;
    }
    
    public function getHuisnr() {
        return $this->huisnr;
    }
    
    public function getBusnr() {
        return $this->busnr;
    }
    
    public function getPostcode() {
        return $this->postcode;
    }
    
    public function getGemeente() {
        return $this->gemeente;
    }
    
    public function getTelefoon() {
        return $this->telefoon;
    }
    
    public function getEmail() {
        return $this->email;
    }
    
    public function getPaswoord() {
        return $this->paswoord;
    }
    
    public function getStatus() {
        return $this->status;
    }
    
    public function getInfo() {
        return $this->info;
    }
    
}
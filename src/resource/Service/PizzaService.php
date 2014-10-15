<?php

namespace resource\Service;

use stdClass;
use resource\Data\KlantDAO;
use resource\Data\ProductDAO;
use resource\Data\BestellingDAO;
use resource\Data\BestellijnDAO;
use resource\Exception\FouteInvoerException;
use resource\Exception\FoutPaswoordException;
use resource\Exception\KlantNietGevondenException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class PizzaService {
    
    /* * * * * Scripttimer * * * * */
    
    public function ScriptTimer() {
        $timer = new stdClass();
        $processtime = round((microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"]) * 1000);
        if ($processtime <= 50) {
            $frontcolor = "green";
            $backcolor = "#CCFFCC";
        } elseif ($processtime > 50 && $processtime <= 100) {
            $frontcolor = "#999966";
            $backcolor = "#FFFFAA";
        } elseif ($processtime > 100 && $processtime <= 200) {
            $frontcolor = "orange";
            $backcolor = "#FFDD55";
        } elseif ($processtime > 200) {
            $frontcolor = "red";
            $backcolor = "#FFCCCC";
        }
        $timer->time = $processtime;
        $timer->fgcolor = $frontcolor;
        $timer->bgcolor = $backcolor;
        return $timer;
    }
    
    /* * * * * Cryptologie * * * * */
    
    public function doCrypt($word) {
        // SHA-1 volgens opgave; indien nodig kan hier een andere cryptwijze uitgevoerd worden
        $cryptword = sha1($word);
        return $cryptword;
    }
    
    /* * * * * Login-functies * * * * */
    
    public function loginKlant($email, $paswoord) {
        $zoekKlant = KlantDAO::getByEmail($email);
        $dbpaswoord = $zoekKlant->getPaswoord();
        // SHA-1 hashing decryptie en check, volgens opgave
        $cryptpaswoord = PizzaService::doCrypt($paswoord);
        if($cryptpaswoord != $dbpaswoord) {
            throw new FoutPaswoordException();
        }
        return $zoekKlant;
    }
    
    /*
     * 
     * * * Gebruikersfuncties * * *
     * 
     */
    
    public function geefAlleGebruikers() {
        $klantDAO = new KlantDAO();
        $gebruikersLijst = $klantDAO->getAll();
        return $gebruikersLijst;
    }
    
    public function geefGebruikerById($id) {
        $klantDAO = new KlantDAO();
        $deKlant = $klantDAO->getById($id);
        return $deKlant;
    }
    
    public function geefGebruikerByEmail($email) {
        $klantDAO = new KlantDAO();
        $deKlant = $klantDAO->getByEmail($email);
        return $deKlant;
    }
    
    public function nieuweKlant($anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info) {
        $klantDAO = new KlantDAO();
        // checkt eerst of een klant al bestaat;
        // indien ja => exception naar controllerlaag
        // indien nee => door met code
        try {
            $klantDAO->getByEmail($email);
            throw new FouteInvoerException();
        } catch (KlantNietGevondenException $ex) {
            $cryptpaswoord = PizzaService::doCrypt($paswoord);
            $klantDAO->createKlant($anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $cryptpaswoord, $status, $info);
        }
    }
    
    /* * * Voorlopig niet toegepast * * */
    /*
    public function veranderKlant($id, $anaam, $vnaam, $adres, $huisnr, $busnr, $postcode, $gemeente, $email, $paswoord) {
        $klantDAO = new KlantDAO();
        $cryptpaswoord = WijnService::doCrypt($paswoord);
        $klantDAO->updateKlant($id, $anaam, $vnaam, $adres, $huisnr, $busnr, $postcode, $gemeente, $email, $cryptpaswoord);
    }
    
    public function verwijderKlant($email) {
        $klantDAO = new KlantDAO();
        $klantDAO->deleteKlant($email);
    }
    */
    
    public function valideerPaswoord($paswoord) {
        // moet een bepaalde regexp matchen
        // minimaal 6 en maximaal 32 karakters lang
        // ten minste 1 cijfer
        // ten minste 1 hoofdletter
        // ten minste 1 kleine letter
        if (strlen($paswoord) > 32) {
            throw new FouteInvoerException();
        }
        $regexpstring = "/^.*(?=.{6,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/";
        if (preg_match($regexpstring, $paswoord) == 0) {
            throw new FouteInvoerException();
        }
        return true;
    }
    
    /* * * * * Zoekfuncties * * * * */
    
    public function zoekProduct_opNaam($naam) {
        $productDAO = new ProductDAO();
        $productlijst = $productDAO::searchByName($naam);
        return $productlijst;
    }
    
    public function zoekProduct_opOmschrijving($omschrijving) {
        $productDAO = new ProductDAO();
        $productlijst = $productDAO::searchByOmschrijving($omschrijving);
        return $productlijst;
    }
    
    public function zoekProduct_opPromotie($promo_type) {
        $productDAO = new ProductDAO();
        $productlijst = $productDAO::searchByPromo($promo_type);
        return $productlijst;
    }
    
    /* * * * * Lijsting functies * * * * */
    
    static function sortByOption($a, $b) {
        // wordt gebruikt om de objectlijst te sorteren op keys
        return strcmp($a["naam"], $b["naam"]);
    }
    
    public function geefAlleProducten() {
        $productDAO = new ProductDAO();
        $productlijst = $productDAO->getAll();
        return $productlijst;
    }
    
    public function geefAllePromotieProducten() {
        $productDAO = new ProductDAO();
        $productlijst = $productDAO->getAllInPromo();
        return $productlijst;
    }
    
    /* * * * * Mandjefuncties * * * * */
    
    public function bevestigMandje($mandje) {
        // zoek de klant
        $klant_id = $mandje->klant_id;
        // maak een bestelling
        $besteldatum = date("Y-m-d H:i:s");
        $leverdatum = $mandje->leverdatum;
        $opmerking = $mandje->klant_opmerking;
        $bestellingDAO = new BestellingDAO();
        $bestellingId = $bestellingDAO->maakNieuweBestelling($klant_id, $besteldatum, $leverdatum, "", "", 0, $opmerking);
        // maak de aparte bestellijnen
        $bestellijnDAO = new BestellijnDAO();
        foreach ($mandje->bestelling as $bestellijn) {
            $bestellijnDAO->createBestellijn($bestellingId, $bestellijn->product_id, $bestellijn->aantal, $bestellijn->prijs);
        }
        return true;
    }
    
}
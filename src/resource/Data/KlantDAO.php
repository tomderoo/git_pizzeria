<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Klant;
use resource\Exception\KlantNietGevondenException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class KlantDAO {
    
    public function getAll() {
        $klantLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM klanten ORDER BY email ASC");
        $sql->execute();
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisKlant = Klant::create($rij["id"], $rij["anaam"], $rij["vnaam"], $rij["straat"], $rij["huisnr"], $rij["busnr"], $rij["postcode"], $rij["gemeente"], $rij["telefoon"], $rij["email"], $rij["paswoord"], $rij["status"], $rij["info"]);
            array_push($klantLijst, $thisKlant);
        }
        return $klantLijst;
    }
    
    public function getById($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM klanten WHERE id=:id");
        $sql->bindParam(":id", $id);
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new KlantNietGevondenException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $foundKlant = Klant::create($rij["id"], $rij["anaam"], $rij["vnaam"], $rij["straat"], $rij["huisnr"], $rij["busnr"], $rij["postcode"], $rij["gemeente"], $rij["telefoon"], $rij["email"], $rij["paswoord"], $rij["status"], $rij["info"]);
        return $foundKlant;
    }
    
    public function getByEmail($email) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM klanten WHERE email=:email");
        $sql->bindParam(":email", $email);
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new KlantNietGevondenException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $foundKlant = Klant::create($rij["id"], $rij["anaam"], $rij["vnaam"], $rij["straat"], $rij["huisnr"], $rij["busnr"], $rij["postcode"], $rij["gemeente"], $rij["telefoon"], $rij["email"], $rij["paswoord"], $rij["status"], $rij["info"]);
        return $foundKlant;
    }
    
    public function createKlant($anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO klanten (anaam, vnaam, straat, huisnr, busnr, postcode, gemeente, telefoon, email, paswoord, status, info) VALUES (:anaam, :vnaam, :straat, :huisnr, :busnr, :postcode, :gemeente, :telefoon, :email, :paswoord, :status, :info)");
        $sql->bindParam(":anaam", $anaam);
        $sql->bindParam(":vnaam", $vnaam);
        $sql->bindParam(":straat", $straat);
        $sql->bindParam(":huisnr", $huisnr);
        $sql->bindParam(":busnr", $busnr);
        $sql->bindParam(":postcode", $postcode);
        $sql->bindParam(":gemeente", $gemeente);
        $sql->bindParam(":telefoon", $telefoon);
        $sql->bindParam(":email", $email);
        $sql->bindParam(":paswoord", $paswoord);
        $sql->bindParam(":status", $status);
        $sql->bindParam(":info", $info);
        print_r($sql);
        $sql->execute();
    }
    
    /* Momenteel niet gebruikt
     * enkel toegevoegd voor referentie als codebasis (nog geen toepassing van try/catch en dergelijke)
     */
    
    /*
    public function updateKlant($id, $anaam, $vnaam, $straat, $huisnr, $busnr, $postcode, $gemeente, $telefoon, $email, $paswoord, $status, $info) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE klanten SET anaam = :anaam, vnaam = :vnaam, straat = :straat, huisnr = :huisnr, busnr = :busnr, postcode = :postcode, gemeente = :gemeente, telefoon = :telefoon, email = :email, paswoord = :paswoord, status = :status, info = :info WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->bindParam(":anaam", $anaam);
        $sql->bindParam(":vnaam", $vnaam);
        $sql->bindParam(":straat", $straat);
        $sql->bindParam(":huisnr", $huisnr);
        $sql->bindParam(":busnr", $busnr);
        $sql->bindParam(":postcode", $postcode);
        $sql->bindParam(":gemeente", $gemeente);
        $sql->bindParam(":telefoon", $telefoon);
        $sql->bindParam(":email", $email);
        $sql->bindParam(":paswoord", $paswoord);
        $sql->bindParam(":status", $status);
        $sql->bindParam(":info", $info);
        $sql->execute();
    }
    
    public function deleteKlant($email) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM klanten WHERE email = :email");
        $sql->bindParam(":email", $email);
        $sql->execute();
    }
    */
}
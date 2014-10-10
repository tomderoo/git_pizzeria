<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Bestelling;
use resource\Exception\OnvindbaarException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class BestellingDAO {
    
    public function getAll() {
        $bestellingLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM bestelling ORDER BY id DESC");
        $sql->execute();
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisBestelling = Bestelling::create($rij["id"], $rij["klant_id"], $rij["besteldatum"], $rij["leverdatum"], $rij["koerier_brief"], $rij["koerier_debrief"], $rij["status"], $rij["opmerking"]);
            push_array($bestellingLijst, $thisBestelling);
        }
        return $bestellingLijst;
    }
    
    public function getByKlantId($klant_id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM bestelling WHERE klant_id = :klant_id");
        $sql->bindParam(":klant_id", $klant_id);
        $sql->execute();
        if ($sql->rowCount() === 0) {
            throw new OnvindbaarException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $foundBestelling = Bestelling::create($rij["id"], $rij["klant_id"], $rij["besteldatum"], $rij["leverdatum"], $rij["koerier_brief"], $rij["koerier_debrief"], $rij["status"], $rij["opmerking"]);
        return $foundBestelling;
    }
    
    public function maakNieuweBestelling($klant_id, $besteldatum, $leverdatum, $koerier_brief, $koerier_debrief, $status, $opmerking) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO bestelling (klant_id, besteldatum, leverdatum, koerier_brief, koerier_debrief, status, opmerking) VALUES (:klant_id, :besteldatum, :leverdatum, :koerier_brief, :koerier_debrief, :status, :opmerking)");
        $sql->bindParam(":klant_id", $klant_id);
        $sql->bindParam(":besteldatum", $besteldatum);
        $sql->bindParam(":leverdatum", $leverdatum);
        $sql->bindParam(":koerier_brief", $koerier_brief);
        $sql->bindParam(":koerier_debrief", $koerier_debrief);
        $sql->bindParam(":status", $status);
        $sql->bindParam(":opmerking", $opmerking);
        $sql->execute();
        $bestellijstid = intval($dbh->lastInsertId());
        return $bestellijstid;
    }
    
    public function deleteBestelling($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM bestelling WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
    
    public function updateStatus($id, $status) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE bestellingen SET status = :status WHERE id = :id");
        $sql->bindParam(":status", $status);
        $sql->bindParam(":id", $id);
        $sql->execute();
    }

    public function updateKoerierBrief($id, $koerier_brief) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE bestellingen SET koerier_brief = :koerier_brief WHERE id = :id");
        $sql->bindParam(":koerier_brief", $koerier_brief);
        $sql->bindParam(":id", $id);
        $sql->execute();
    }

    public function updateKoerierDebrief($id, $koerier_debrief) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE bestellingen SET koerier_debrief = :koerier_debrief WHERE id = :id");
        $sql->bindParam(":koerier_debrief", $koerier_debrief);
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
}
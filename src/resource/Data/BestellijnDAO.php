<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Bestellijn;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class BestellijnDAO {
    
    public function getAll() {
        $bestellijnLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM bestellijn ORDER BY id ASC");
        $sql->execute();
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisBestellijn = Bestellijn::create($rij["id"], $rij["bestelling_id"], $rij["product_id"], $rij["aantal"], $rij["prijs_hist"]);
            push_array($bestellijnLijst, $thisBestellijn);
        }
        return $bestellijnLijst;
    }
    
    // functie voor prijshistoriek van een product te kunnen bekijken
    public function getAllByProductId($product_id) {
        $bestellijnLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM bestellijn WHERE product_id = :product_id ORDER BY id ASC");
        $sql->bindParam(":product_id", $product_id);
        $sql->execute();
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisBestellijn = Bestellijn::create($rij["id"], $rij["bestelling_id"], $rij["product_id"], $rij["aantal"], $rij["prijs_hist"]);
            push_array($bestellijnLijst, $thisBestellijn);
        }
        return $bestellijnLijst;
    }
    
    public function getByBestellingId($bestelling_id) {
        $bestellijnLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM bestellijn WHERE bestelling_id = :bestelling_id ORDER BY id ASC");
        $sql->bindParam(":bestelling_id", $bestelling_id);
        $sql->execute();
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisBestellijn = Bestellijn::create($rij["id"], $rij["bestelling_id"], $rij["product_id"], $rij["aantal"], $rij["prijs_hist"]);
            push_array($bestellijnLijst, $thisBestellijn);
        }
        return $bestellijnLijst;
    }
    
    public function createBestellijn($bestelling_id, $product_id, $aantal, $prijs_hist) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO bestellijn (bestelling_id, product_id, aantal, prijs_hist) VALUES (:bestelling_id, :product_id, :aantal, :prijs_hist)");
        $sql->bindParam(":bestelling_id", $bestelling_id);
        $sql->bindParam(":product_id", $product_id);
        $sql->bindParam(":aantal", $aantal);
        $sql->bindParam(":prijs_hist", $prijs_hist);
        $sql->execute();
        $lijnid = intval($dbh->lastInsertId());
        return $lijnid;
    }
    
    public function updateBestellijn($id, $bestelling_id, $product_id, $aantal, $prijs_hist) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE bestellijn SET bestelling_id = :bestelling_id, product_id = :product_id, aantal = :aantal, prijs_hist = :prijs_hist WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->bindParam(":bestelling_id", $bestelling_id);
        $sql->bindParam(":product_id", $product_id);
        $sql->bindParam(":aantal", $aantal);
        $sql->bindParam(":prijs_hist", $prijs_hist);
        $sql->execute();
    }
    
    public function deleteBestellijn($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM bestellijn WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
}
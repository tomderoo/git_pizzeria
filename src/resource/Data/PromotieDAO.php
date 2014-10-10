<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Promotie;
use resource\Entities\Promotype;
use resource\Exception\OnvindbaarException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class PromotieDAO {
    
    public function getAll() {
        $promotieLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM promoties ORDER BY datum_start DESC, datum_eind ASC");
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        $promotypeLijst = Promotype::getAsArray();
        foreach ($resultSet as $rij) {
            $thisPromotie = Promotie::create($rij["id"], $rij["datum_start"], $rij["datum_eind"], $rij["product_id"], $rij["promoprijs"], $rij["omschrijving"], $promotypeLijst[$rij["promotype"]]);
            array_push($promotieLijst, $thisPromotie);
        }
        return $promotieLijst;
    }
    
    public function getById($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM promoties WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $promotypeLijst = Promotype::getAsArray();
        $thisPromotie = Promotie::create($rij["id"], $rij["datum_start"], $rij["datum_eind"], $rij["product_id"], $rij["promoprijs"], $rij["omschrijving"], $promotypeLijst[$rij["promotype"]]);
        return $thisPromotie;
    }
    
    public function createPromotie($datum_start, $datum_eind, $product_id, $promoprijs, $omschrijving, $promotype) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO promoties (datum_start, datum_eind, product_id, promoprijs, omschrijving, promotype) VALUES (:datum_start, :datum_eind, :product_id, :promoprijs, :omschrijving, :promotype)");
        $sql->bindParam(":datum_start", $datum_start);
        $sql->bindParam(":datum_eind", $datum_eind);
        $sql->bindParam(":product_id", $product_id);
        $sql->bindParam(":promoprijs", $promoprijs);
        $sql->bindParam(":omschrijving", $omschrijving);
        $sql->bindParam(":promotype", $promotype);
        $sql->execute();
        $lijnid = intval($dbh->lastInsertId());
        return $lijnid;
    }
    
    public function updatePromotie($id, $datum_start, $datum_eind, $product_id, $promoprijs, $omschrijving, $promotype) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE promoties SET datum_start = :datum_start, datum_eind :datum_eind, product_id = :product_id , promoprijs = :promoprijs, omschrijving = :omschrijving, promotype = :promotype WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->bindParam(":datum_start", $datum_start);
        $sql->bindParam(":datum_eind", $datum_eind);
        $sql->bindParam(":product_id", $product_id);
        $sql->bindParam(":promoprijs", $promoprijs);
        $sql->bindParam(":omschrijving", $omschrijving);
        $sql->bindParam(":promotype", $promotype);
        $sql->execute();
    }
    
    public function deletePromotie($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM promoties WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
}
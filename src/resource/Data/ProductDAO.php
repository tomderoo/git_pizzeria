<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Product;
use resource\Entities\Promotype;
use resource\Exception\OnvindbaarException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class ProductDAO {
    
    public function getAll() {
        $productLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product ORDER BY naam, prijs ASC");
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisProduct = Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
            array_push($productLijst, $thisProduct);
        }
        return $productLijst;
    }
    
    public function getAllInPromo() {
        $productLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product WHERE NOT promo_type = 0 ORDER BY naam, prijs ASC");
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisProduct = Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
            array_push($productLijst, $thisProduct);
        }
        return $productLijst;
    }
    
    public function getById($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $thisProduct = Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
        return $thisProduct;
    }
    
    public function createProduct($naam, $omschrijving, $prijs, $promo_type = 0, $promo_tekst = "", $promo_prijs = 0) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO product (naam, omschrijving, prijs, promo_type, promo_tekst, promo_prijs) VALUES (:naam, :omschrijving, :prijs, :promo_type, :promo_tekst, :promo_prijs)");
        $sql->bindParam(":naam", $naam);
        $sql->bindParam(":omschrijving", $omschrijving);
        $sql->bindParam(":prijs", $prijs);
        $sql->bindParam(":promo_type", $promo_type);
        $sql->bindParam(":promo_tekst", $promo_tekst);
        $sql->bindParam(":promo_prijs", $promo_prijs);
        $sql->execute();
        $lijnid = intval($dbh->lastInsertId());
        return $lijnid;
    }
    
    public function updateProduct($id, $naam, $omschrijving, $prijs, $promo_type = 0, $promo_tekst = "", $promo_prijs = 0) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE product SET naam = :naam, omschrijving = :omschrijving, prijs = :prijs, promo_type = :promo_type, promo_tekst = :promo_tekst, promo_prijs = :promo_prijs WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->bindParam(":naam", $naam);
        $sql->bindParam(":omschrijving", $omschrijving);
        $sql->bindParam(":prijs", $prijs);
        $sql->bindParam(":promo_type", $promo_type);
        $sql->bindParam(":promo_tekst", $promo_tekst);
        $sql->bindParam(":promo_prijs", $promo_prijs);
        $sql->execute();
    }
    
    public function deleteProduct($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM product WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
    
    /* * * * * Zoekfuncties * * * * */
    
    public function searchByNaam($naam) {
        $productLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product WHERE naam LIKE :naam ORDER BY naam, prijs ASC");
        $naam = str_replace("*", "%", $naam);
        if (strpos($naam, "%") === false) {
            $naam = "%" . $naam . "%";
        }
        $sql->bindParam(":naam", $naam);
        $sql->execute();
        if ($sql->rowCount() === 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
            array_push($productLijst, $thisProduct);
        }
        return $productLijst;
    }
    
    public function searchByOmschrijving($omschrijving) {
        $productLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product WHERE omschrijving LIKE :omschrijving ORDER BY naam, prijs ASC");
        $omschrijving = str_replace("*", "%", $omschrijving);
        if (strpos($omschrijving, "%") === false) {
            $omschrijving = "%" . $omschrijving . "%";
        }
        $sql->bindParam(":omschrijving", $omschrijving);
        $sql->execute();
        if ($sql->rowCount() === 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisProduct = Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
            array_push($productLijst, $thisProduct);
        }
        return $productLijst;
    }
    
    public function searchByPromo($promo_type) {
        $productLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM product WHERE promo_type = :promo_type ORDER BY naam, prijs ASC");
        $sql->bindParam(":promo_type", $promo_type);
        $sql->execute();
        if ($sql->rowCount() === 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisProduct = Product::create($rij["id"], $rij["naam"], $rij["omschrijving"], $rij["prijs"], $rij["promo_type"], $rij["promo_tekst"], $rij["promo_prijs"]);
            array_push($productLijst, $thisProduct);
        }
        return $productLijst;
    }
}
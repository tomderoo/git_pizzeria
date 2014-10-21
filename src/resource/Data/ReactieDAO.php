<?php

namespace resource\Data;

use \PDO;
use resource\Data\dbConfig;
use resource\Entities\Reactie;
use resource\Exception\OnvindbaarException;
use Doctrine\Common\ClassLoader;
require_once("Doctrine/Common/ClassLoader.php");
$classLoader = new ClassLoader("resource", "src");
$classLoader->register();

class ReactieDAO {
    
    public function getAll() {
        $reactieLijst = array();
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM reacties ORDER BY id DESC");
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $resultSet = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultSet as $rij) {
            $thisReactie = Reactie::create($rij["id"], $rij["klant_id"], $rij["reactie"]);
            array_push($reactieLijst, $thisReactie);
        }
        return $reactieLijst;
    }
    
    public function getById($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("SELECT * FROM reacties WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
        if ($sql->rowCount() == 0) {
            throw new OnvindbaarException();
        }
        $rij = $sql->fetch(PDO::FETCH_ASSOC);
        $thisReactie = Reactie::create($rij["id"], $rij["klant_id"], $rij["reactie"]);
        return $thisReactie;
    }
    
    public function createReactie($klant_id, $reactie) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("INSERT INTO reacties (klant_id, reactie) VALUES (:klant_id, :reactie)");
        $sql->bindParam(":klant_id", $klant_id);
        $sql->bindParam(":reactie", $reactie);
        $sql->execute();
        $lijnid = intval($dbh->lastInsertId());
        return $lijnid;
    }
    
    public function updateReactie($id, $klant_id, $reactie) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("UPDATE reacties SET klant_id = :klant_id, reactie = :reactie WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->bindParam(":klant_id", $klant_id);
        $sql->bindParam(":reactie", $reactie);
        $sql->execute();
    }
    
    public function deleteReactie($id) {
        $dbh = new PDO(dbConfig::$db_conn, dbConfig::$db_user, dbConfig::$db_pass);
        $sql = $dbh->prepare("DELETE FROM reacties WHERE id = :id");
        $sql->bindParam(":id", $id);
        $sql->execute();
    }
    
}
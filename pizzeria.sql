-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Machine: 127.0.0.1
-- Gegenereerd op: 10 okt 2014 om 16:02
-- Serverversie: 5.6.16
-- PHP-versie: 5.5.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Databank: `pizzeria`
--

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bestellijn`
--

CREATE TABLE IF NOT EXISTS `bestellijn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bestelling_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `aantal` int(11) NOT NULL,
  `prijs_hist` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bestelling_id` (`bestelling_id`,`product_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=13 ;

--
-- Gegevens worden geëxporteerd voor tabel `bestellijn`
--

INSERT INTO `bestellijn` (`id`, `bestelling_id`, `product_id`, `aantal`, `prijs_hist`) VALUES
(11, 1, 1, 1, 1100),
(12, 1, 2, 1, 1600);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bestelling`
--

CREATE TABLE IF NOT EXISTS `bestelling` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `klant_id` int(11) NOT NULL,
  `besteldatum` datetime NOT NULL,
  `leverdatum` datetime NOT NULL,
  `koerier_brief` text NOT NULL,
  `koerier_debrief` text NOT NULL,
  `status` int(11) NOT NULL,
  `klant_opmerking` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `klant_id` (`klant_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Gegevens worden geëxporteerd voor tabel `bestelling`
--

INSERT INTO `bestelling` (`id`, `klant_id`, `besteldatum`, `leverdatum`, `koerier_brief`, `koerier_debrief`, `status`, `klant_opmerking`) VALUES
(1, 1, '2014-10-10 15:58:00', '2014-10-10 12:31:50', '', '', 0, '');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `klanten`
--

CREATE TABLE IF NOT EXISTS `klanten` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `anaam` varchar(50) NOT NULL,
  `vnaam` varchar(25) NOT NULL,
  `straat` varchar(50) NOT NULL,
  `huisnr` varchar(10) NOT NULL,
  `busnr` varchar(5) NOT NULL,
  `postcode` varchar(10) NOT NULL,
  `gemeente` varchar(25) NOT NULL,
  `telefoon` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `paswoord` varchar(100) NOT NULL,
  `status` int(11) NOT NULL,
  `info` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `product`
--

CREATE TABLE IF NOT EXISTS `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `naam` varchar(50) NOT NULL,
  `omschrijving` text NOT NULL,
  `prijs` int(11) NOT NULL,
  `promo_type` int(11) NOT NULL,
  `promo_tekst` text NOT NULL,
  `promo_prijs` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Gegevens worden geëxporteerd voor tabel `product`
--

INSERT INTO `product` (`id`, `naam`, `omschrijving`, `prijs`, `promo_type`, `promo_tekst`, `promo_prijs`) VALUES
(1, 'Pizza Quattro Colore', 'Een explosie van kleuren! Ananas, papaya, zongedroogde tomaat, oranje salami, paprika''s...', 1100, 0, '', 0),
(2, 'Pizza Al Uovo Gigantea', 'De gezonde eierbom! Scharreleieren, zeewier, oregano en volledig biologische deeg', 1800, 1, 'Tijdelijk in prijs verlaagd wegens hoogstproductieve kiekens!', 1600);

--
-- Beperkingen voor geëxporteerde tabellen
--

--
-- Beperkingen voor tabel `bestellijn`
--
ALTER TABLE `bestellijn`
  ADD CONSTRAINT `bestellijn_ibfk_1` FOREIGN KEY (`bestelling_id`) REFERENCES `bestelling` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bestellijn_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

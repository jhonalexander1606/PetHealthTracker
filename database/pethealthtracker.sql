-- =====================================================================
-- PROYECTO: PetHealth Tracker
-- Pasaporte Sanitario Digital y Control del Historial Medico de Mascotas
-- Materia: Entornos de Programacion - UIS 2026-II
-- Grupo 02 - David Munoz, Jhon Calderon, Juan Diego Tellez
-- Base de Datos: MySQL / MariaDB
-- =====================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- ---------------------------------------------------------------------
-- Crear la base de datos
-- ---------------------------------------------------------------------
DROP DATABASE IF EXISTS `pethealthtracker`;
CREATE DATABASE IF NOT EXISTS `pethealthtracker`
    /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish2_ci */;
USE `pethealthtracker`;

-- ---------------------------------------------------------------------
-- Tabla: tipodocumento
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipodocumento` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tipo` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

INSERT INTO `tipodocumento` (`id`, `tipo`) VALUES
    (1, 'CEDULA'),
    (2, 'TARJETA DE IDENTIDAD'),
    (3, 'CEDULA DE EXTRANJERIA'),
    (4, 'PASAPORTE');

-- ---------------------------------------------------------------------
-- Tabla: usuario (duenos de mascotas y administradores del sistema)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `idTipoDocumento` int(11) NOT NULL,
    `numeroDocumento` varchar(40) COLLATE utf8_spanish2_ci NOT NULL,
    `nombreCompleto` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
    `email` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
    `telefono` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
    `nombreUsuario` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
    `password` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
    `rol` varchar(20) COLLATE utf8_spanish2_ci NOT NULL DEFAULT 'DUENO',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_nombreusuario` (`nombreUsuario`),
    KEY `fk_tipodocumento_usuario` (`idTipoDocumento`),
    CONSTRAINT `fk_tipodocumento_usuario` FOREIGN KEY (`idTipoDocumento`)
        REFERENCES `tipodocumento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- Usuarios por defecto.
-- IMPORTANTE: las contrasenas estan almacenadas con hash BCrypt (Spring Security).
-- Las credenciales reales para iniciar sesion son:
--    admininicial / admin123456   (rol ADMIN)
--    davidmunoz   / 123456         (rol VETERINARIO)
--    jhoncalderon / 123456         (rol DUENO)
--    juantellez   / 123456         (rol DUENO)
INSERT INTO `usuario`
    (`idTipoDocumento`, `numeroDocumento`, `nombreCompleto`, `email`, `telefono`, `nombreUsuario`, `password`, `rol`)
VALUES
    (1, '1098765432', 'Administrador Inicial', 'admin@pethealth.co', '3001234567', 'admininicial', '$2b$10$ADNBR2MBCSrcuQZJZ7CUmukm1P6gd5SyjMalXfsJJYmRHcht/60Ym', 'ADMIN'),
    (1, '2234570', 'Jhon Alexander Calderon Munoz', 'jhon@uis.edu.co', '3157894561', 'jhoncalderon', '$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y', 'DUENO'),
    (1, '2234504', 'David Fernando Munoz Ortiz', 'david@uis.edu.co', '3202345678', 'davidmunoz', '$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y', 'VETERINARIO'),
    (1, '2234511', 'Juan Diego Tellez Quintero', 'juan@uis.edu.co', '3119876543', 'juantellez', '$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y', 'DUENO');

-- ---------------------------------------------------------------------
-- Tabla: mascota (ficha sanitaria de cada mascota)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mascota` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `idUsuario` int(11) NOT NULL,
    `nombre` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
    `especie` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
    `raza` varchar(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
    `edad` int(11) NOT NULL,
    `sexo` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
    `peso` double DEFAULT NULL,
    `color` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_usuario_mascota` (`idUsuario`),
    CONSTRAINT `fk_usuario_mascota` FOREIGN KEY (`idUsuario`)
        REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- Datos de ejemplo
INSERT INTO `mascota` (`idUsuario`, `nombre`, `especie`, `raza`, `edad`, `sexo`, `peso`, `color`) VALUES
    (2, 'Rocky', 'Perro', 'Labrador Retriever', 3, 'Macho', 28.5, 'Dorado'),
    (2, 'Luna', 'Gato', 'Persa', 2, 'Hembra', 4.2, 'Blanco'),
    (3, 'Max', 'Perro', 'Golden Retriever', 5, 'Macho', 32.0, 'Dorado'),
    (4, 'Michi', 'Gato', 'Siames', 1, 'Hembra', 3.5, 'Gris');

-- ---------------------------------------------------------------------
-- Tabla: eventomedico (vacunas, consultas, desparasitaciones, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `eventomedico` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `idMascota` int(11) NOT NULL,
    `tipoEvento` varchar(80) COLLATE utf8_spanish2_ci NOT NULL,
    `fechaAplicacion` date NOT NULL,
    `veterinariaClinica` varchar(200) COLLATE utf8_spanish2_ci DEFAULT NULL,
    `veterinario` varchar(150) COLLATE utf8_spanish2_ci DEFAULT NULL,
    `notasDiagnostico` text COLLATE utf8_spanish2_ci,
    `fechaProximaDosis` date DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_mascota_evento` (`idMascota`),
    CONSTRAINT `fk_mascota_evento` FOREIGN KEY (`idMascota`)
        REFERENCES `mascota` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- Datos de ejemplo
INSERT INTO `eventomedico`
    (`idMascota`, `tipoEvento`, `fechaAplicacion`, `veterinariaClinica`, `veterinario`, `notasDiagnostico`, `fechaProximaDosis`)
VALUES
    (1, 'VACUNA ANTIRRABICA', '2026-01-15', 'VetCare Bucaramanga', 'Dr. Pedro Ramirez', 'Vacuna aplicada sin reaccion adversa', '2027-01-15'),
    (1, 'DESPARASITACION', '2026-06-20', 'VetCare Bucaramanga', 'Dr. Pedro Ramirez', 'Desparasitante oral administrado', '2026-12-20'),
    (2, 'VACUNA TRIPLE FELINA', '2026-03-10', 'Clinica Mascotas UIS', 'Dra. Ana Suarez', 'Primera dosis de triple felina', '2027-03-10'),
    (3, 'CONSULTA GENERAL', '2026-09-05', 'VetCare Bucaramanga', 'Dr. Pedro Ramirez', 'Chequeo anual sin novedades', NULL);

/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================

-- =====================================================================
-- PetHealth Tracker - DATOS DE DEMOSTRACION (opcional)
-- Entornos de Programacion - UIS 2026-II - Grupo 02
-- ---------------------------------------------------------------------
-- Ejecutar DESPUES de pethealthtracker.sql. Agrega mas duenos, mascotas y
-- eventos medicos para que el dashboard, las graficas, el calendario y las
-- alertas de vacunacion se vean con datos reales.
--
-- * Las fechas se calculan a partir de HOY (CURDATE()), asi que siempre
--   habra vacunas vencidas y proximas a vencer, sin importar el dia en que
--   se haga la sustentacion.
-- * Es seguro ejecutarlo varias veces: no duplica registros.
-- * Usuarios nuevos (contrasena 123456): mariarojas, carlosperez (DUENO)
--   y draluragomez (VETERINARIO).
-- =====================================================================

USE `pethealthtracker`;

-- --------------------------- Usuarios ---------------------------------

INSERT INTO `usuario` (`idTipoDocumento`,`numeroDocumento`,`nombreCompleto`,`email`,`telefono`,`nombreUsuario`,`password`,`rol`)
SELECT 1,'1095123456','Maria Fernanda Rojas Diaz','maria.rojas@gmail.com','3174561234','mariarojas','$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y','DUENO' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `usuario` WHERE `nombreUsuario`='mariarojas' OR `numeroDocumento`='1095123456');

INSERT INTO `usuario` (`idTipoDocumento`,`numeroDocumento`,`nombreCompleto`,`email`,`telefono`,`nombreUsuario`,`password`,`rol`)
SELECT 1,'1098654321','Carlos Andres Perez Gomez','carlos.perez@gmail.com','3009876543','carlosperez','$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y','DUENO' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `usuario` WHERE `nombreUsuario`='carlosperez' OR `numeroDocumento`='1098654321');

INSERT INTO `usuario` (`idTipoDocumento`,`numeroDocumento`,`nombreCompleto`,`email`,`telefono`,`nombreUsuario`,`password`,`rol`)
SELECT 1,'63452198','Laura Patricia Gomez','dra.laura@vetsantander.co','3145550198','draluragomez','$2b$10$EWqzoHELtNFs2lLI.QUiGenFJesmujFKpC181/5xyDANBc17uFe5y','VETERINARIO' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `usuario` WHERE `nombreUsuario`='draluragomez' OR `numeroDocumento`='63452198');


-- --------------------------- Mascotas ---------------------------------

INSERT INTO `mascota` (`idUsuario`,`nombre`,`especie`,`raza`,`edad`,`sexo`,`peso`,`color`)
SELECT u.`id`,'Toby','Perro','Beagle',4,'Macho',12.3,'Tricolor' FROM `usuario` u
WHERE u.`nombreUsuario`='mariarojas' AND NOT EXISTS (SELECT 1 FROM `mascota` m WHERE m.`nombre`='Toby');

INSERT INTO `mascota` (`idUsuario`,`nombre`,`especie`,`raza`,`edad`,`sexo`,`peso`,`color`)
SELECT u.`id`,'Nube','Conejo','Cabeza de Leon',2,'Hembra',1.6,'Blanco' FROM `usuario` u
WHERE u.`nombreUsuario`='mariarojas' AND NOT EXISTS (SELECT 1 FROM `mascota` m WHERE m.`nombre`='Nube');

INSERT INTO `mascota` (`idUsuario`,`nombre`,`especie`,`raza`,`edad`,`sexo`,`peso`,`color`)
SELECT u.`id`,'Kira','Perro','Pastor Aleman',6,'Hembra',30.1,'Negro y fuego' FROM `usuario` u
WHERE u.`nombreUsuario`='carlosperez' AND NOT EXISTS (SELECT 1 FROM `mascota` m WHERE m.`nombre`='Kira');

INSERT INTO `mascota` (`idUsuario`,`nombre`,`especie`,`raza`,`edad`,`sexo`,`peso`,`color`)
SELECT u.`id`,'Pancho','Ave','Periquito australiano',1,'Macho',0.04,'Verde' FROM `usuario` u
WHERE u.`nombreUsuario`='carlosperez' AND NOT EXISTS (SELECT 1 FROM `mascota` m WHERE m.`nombre`='Pancho');

INSERT INTO `mascota` (`idUsuario`,`nombre`,`especie`,`raza`,`edad`,`sexo`,`peso`,`color`)
SELECT u.`id`,'Simba','Gato','Mestizo',3,'Macho',5.1,'Naranja' FROM `usuario` u
WHERE u.`nombreUsuario`='jhoncalderon' AND NOT EXISTS (SELECT 1 FROM `mascota` m WHERE m.`nombre`='Simba');


-- ------------------------ Eventos medicos ----------------------------

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA TRIPLE FELINA',DATE_SUB(CURDATE(), INTERVAL 377 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Refuerzo anual de triple felina. Pendiente agendar refuerzo.',DATE_SUB(CURDATE(), INTERVAL 12 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Michi') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA TRIPLE FELINA' AND e.`notasDiagnostico`='Refuerzo anual de triple felina. Pendiente agendar refuerzo.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA POLIVALENTE',DATE_SUB(CURDATE(), INTERVAL 368 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Polivalente anual (moquillo, parvovirus, hepatitis).',DATE_SUB(CURDATE(), INTERVAL 3 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Max') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA POLIVALENTE' AND e.`notasDiagnostico`='Polivalente anual (moquillo, parvovirus, hepatitis).');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'DESPARASITACION',DATE_SUB(CURDATE(), INTERVAL 173 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Desparasitante interno en tableta, peso 4.2 kg.',DATE_ADD(CURDATE(), INTERVAL 7 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Luna') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='DESPARASITACION' AND e.`notasDiagnostico`='Desparasitante interno en tableta, peso 4.2 kg.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA ANTIRRABICA',DATE_SUB(CURDATE(), INTERVAL 350 DAY),'Hospital Veterinario Cabecera','Dra. Laura Gomez','Antirrabica anual, sin reacciones.',DATE_ADD(CURDATE(), INTERVAL 15 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Toby') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA ANTIRRABICA' AND e.`notasDiagnostico`='Antirrabica anual, sin reacciones.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'DESPARASITACION',DATE_SUB(CURDATE(), INTERVAL 88 DAY),'Hospital Veterinario Cabecera','Dra. Laura Gomez','Desparasitacion trimestral interna y externa.',DATE_ADD(CURDATE(), INTERVAL 2 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Kira') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='DESPARASITACION' AND e.`notasDiagnostico`='Desparasitacion trimestral interna y externa.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 40 DAY),'Hospital Veterinario Cabecera','Dra. Laura Gomez','Cojera leve en pata trasera izquierda. Antiinflamatorio por 5 dias.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Kira') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Cojera leve en pata trasera izquierda. Antiinflamatorio por 5 dias.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA ANTIRRABICA',DATE_SUB(CURDATE(), INTERVAL 150 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Antirrabica anual.',DATE_ADD(CURDATE(), INTERVAL 215 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Kira') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA ANTIRRABICA' AND e.`notasDiagnostico`='Antirrabica anual.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'DESPARASITACION',DATE_SUB(CURDATE(), INTERVAL 60 DAY),'Hospital Veterinario Cabecera','Dra. Laura Gomez','Desparasitante oral.',DATE_ADD(CURDATE(), INTERVAL 120 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Toby') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='DESPARASITACION' AND e.`notasDiagnostico`='Desparasitante oral.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 12 DAY),'Hospital Veterinario Cabecera','Dra. Laura Gomez','Control de peso: 12.3 kg. Recomendacion de dieta.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Toby') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Control de peso: 12.3 kg. Recomendacion de dieta.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 95 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Revision dental, recorte de incisivos.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Nube') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Revision dental, recorte de incisivos.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA POLIVALENTE',DATE_SUB(CURDATE(), INTERVAL 130 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Vacuna contra mixomatosis y enfermedad hemorragica viral.',DATE_ADD(CURDATE(), INTERVAL 235 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Nube') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA POLIVALENTE' AND e.`notasDiagnostico`='Vacuna contra mixomatosis y enfermedad hemorragica viral.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 25 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Chequeo general, plumaje en buen estado.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Pancho') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Chequeo general, plumaje en buen estado.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'VACUNA TRIPLE FELINA',DATE_SUB(CURDATE(), INTERVAL 20 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Primera dosis anual de triple felina.',DATE_ADD(CURDATE(), INTERVAL 345 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Simba') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='VACUNA TRIPLE FELINA' AND e.`notasDiagnostico`='Primera dosis anual de triple felina.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'ESTERILIZACION',DATE_SUB(CURDATE(), INTERVAL 110 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Orquiectomia sin complicaciones. Retiro de puntos a los 10 dias.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Simba') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='ESTERILIZACION' AND e.`notasDiagnostico`='Orquiectomia sin complicaciones. Retiro de puntos a los 10 dias.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'DESPARASITACION',DATE_SUB(CURDATE(), INTERVAL 5 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Desparasitante interno y pipeta externa.',DATE_ADD(CURDATE(), INTERVAL 175 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Simba') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='DESPARASITACION' AND e.`notasDiagnostico`='Desparasitante interno y pipeta externa.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 70 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Otitis leve oido derecho. Gotas oticas por 7 dias.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Rocky') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Otitis leve oido derecho. Gotas oticas por 7 dias.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CIRUGIA',DATE_SUB(CURDATE(), INTERVAL 140 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Extraccion de cuerpo extrano gastrico. Recuperacion favorable.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Rocky') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CIRUGIA' AND e.`notasDiagnostico`='Extraccion de cuerpo extrano gastrico. Recuperacion favorable.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'DESPARASITACION',DATE_SUB(CURDATE(), INTERVAL 30 DAY),'VetCare Bucaramanga','Dr. Pedro Ramirez','Desparasitante oral, peso 32 kg.',DATE_ADD(CURDATE(), INTERVAL 150 DAY)
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Max') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='DESPARASITACION' AND e.`notasDiagnostico`='Desparasitante oral, peso 32 kg.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 3 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Revision de pelaje; leve dermatitis, champu medicado.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Luna') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Revision de pelaje; leve dermatitis, champu medicado.');

INSERT INTO `eventomedico` (`idMascota`,`tipoEvento`,`fechaAplicacion`,`veterinariaClinica`,`veterinario`,`notasDiagnostico`,`fechaProximaDosis`)
SELECT m.`id`,'CONSULTA GENERAL',DATE_SUB(CURDATE(), INTERVAL 50 DAY),'Clinica Mascotas UIS','Dra. Ana Suarez','Control general, peso 3.5 kg.',NULL
FROM (SELECT MIN(`id`) AS `id` FROM `mascota` WHERE `nombre`='Michi') m
WHERE m.`id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `eventomedico` e WHERE e.`idMascota`=m.`id` AND e.`tipoEvento`='CONSULTA GENERAL' AND e.`notasDiagnostico`='Control general, peso 3.5 kg.');


-- Verificacion rapida
SELECT (SELECT COUNT(*) FROM `usuario`) AS usuarios, (SELECT COUNT(*) FROM `mascota`) AS mascotas, (SELECT COUNT(*) FROM `eventomedico`) AS eventos;

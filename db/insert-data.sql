CREATE TABLE doctors (
    doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    CHECK (speciality IN ("peumologist", "radiologist", "general practicien"))
);

INSERT INTO doctors (first_name, last_name, specialty) VALUES
("Janne", "Dupont", "peumologist"),
("Abdel", "Kader", "radiologist"),
("Alice", "Johnson", "general practicien"),
("Lina", "Sanchez", "general practicien");


CREATE TABLE patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    niss VARCHAR(13) NOT NULL UNIQUE,
    ref_doctor INTEGER NOT NULL,
    street_name VARCHAR(255) NOT NULL,
    street_number VARCHAR(5) NOT NULL,
    city VARCHAR(255) NOT NULL,
    zip_code VARCHAR(5) NOT NULL,
    country VARCHAR(255) NOT NULL DEFAULT "Belgium",
    FOREIGN KEY (ref_doctor) REFERENCES doctors(doctor_id)
);

INSERT INTO patients (first_name, last_name, birthdate, niss, ref_doctor, street_name, street_number, city, zip_code, country) VALUES
("Julles", "Valles", "1971-03-18", "710318-123-45", 1, "Rue de la résitance", "12-C", "Schaerbeek", "1030", "Belgium"),
("Averoes", "Ibn Rochd", "1926-05-11", "260511-123-45", 2, "Rue de la poésie", "2", "Uccle", "1180", "Belgium"),
("Gertrudis", "Gomez de Avellaneda", "2014-10-02", "141002-123-45", 3, "Rue de Cuba", "134", "Brain-l'Alleud", "1420", "Belgium"),
("Kanno", "Sugako", "1981-08-27", "810827-123-45", 2, "Rue de la Paix", "16-3", "Bruxelles", "1011", "Belgium");


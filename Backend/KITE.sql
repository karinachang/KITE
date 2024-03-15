CREATE DATABASE KITE;

use KITE;

CREATE TABLE storage (
    hash 				VARCHAR(255) 	NOT NULL,
    timeOfDeath 		DATETIME,
    remainingDownloads    	INTEGER 		default 99,
	password 			VARCHAR(255),
	storageAddress 		VARCHAR(255),
    PRIMARY KEY (hash)
);

INSERT INTO storage
VALUES(
    SHA2('test', 256),
    '2024-05-05 00:00:00',
	12,
    "password1",
    "./image1.jpg"
);




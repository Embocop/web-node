CREATE TABLE city 
(
  cid int auto_increment,
  country varchar(190),
  city varchar(190),
  accentcity varchar(190),
  region varchar(190),
  population int,
  latitude float,
  longitude float,
  primary key (cid)
);

/*
This database is filled using the text file provided at
https://www.maxmind.com/en/free-world-cities-database

You might have to use the "--local-infile" option.
*/
LOAD DATA LOCAL INFILE 'worldcitiespop.txt'
IGNORE INTO TABLE city
CHARACTER SET 'latin1'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(country, city, accentcity, region, population, latitude, longitude);

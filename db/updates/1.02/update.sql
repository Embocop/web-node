CREATE TABLE spam
(
  pid int not null auto_increment,
  uid int,
  content text not null,
  view int unsigned not null default 0,
  vote int unsigned not null default 0,
  flagged int unsigned not null default 0,
  ip_address varchar(190),
  city varchar(190),
  region varchar(190),
  country varchar(190),
  longitude float,
  latitude float,
  post_time datetime not null default now(),
  clean_stamp datetime not null default now(),
  algo_value float,
  category varchar(190),
  scraped int(1) default 0,
  primary key (pid),
  foreign key (uid) references user (uid),
  fulltext (content)
); 

CREATE TABLE archive
(
  pid int not null auto_increment,
  uid int,
  content text not null,
  view int unsigned not null default 0,
  vote int unsigned not null default 0,
  flagged int unsigned not null default 0,
  ip_address varchar(190),
  city varchar(190),
  region varchar(190),
  country varchar(190),
  longitude float,
  latitude float,
  post_time datetime not null default now(),
  archive_stamp datetime not null default now(),
  algo_value float,
  category varchar(190),
  scraped int(1) default 0,
  primary key (pid),
  foreign key (uid) references user (uid),
  fulltext (content)
); 
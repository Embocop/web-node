-- ******************************************
-- DO NOT MODIFY THIS FILE TO MAKE DB CHANGES
-- ******************************************

-- All DB changes should be placed within ./updates/ as separate .sql files

DROP DATABASE IF EXISTS trendgit;

SET NAMES utf8mb4;
CREATE DATABASE trendgit 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_general_ci;

use trendgit;

CREATE TABLE user
(
  uid int not null auto_increment,
  name varchar (190),
  username varchar(190) not null unique,
  password varchar(190) not null,
  email varchar(190) not null unique,
  bio TEXT,
  icon_ext varchar(190),
  follower int unsigned not null default 0,
  post int unsigned not null default 0,
  coolness float not null default 0,
  vote int unsigned not null default 0,
  rating varchar(190) default "Noob Trend",
  flagged int unsigned not null default 0,
  strike int unsigned not null default 0,
  registered datetime not null default now(),
  primary key (uid)
);

CREATE TABLE following
(
  follower int not null,
  followed int not null,
  follow_time datetime not null default now(),
  primary key(follower, followed),
  foreign key (follower) references user (uid),
  foreign key (followed) references user (uid)
);

CREATE TABLE behavior
(
  uid int not null,
  location varchar(190),
  time_stamp datetime not null default now(),
  behavior_action varchar(190) not null,
  behavior_category varchar(190) not null,
  behavior_target varchar(190) not null,
  primary key(uid, behavior_category, behavior_target, behavior_action, time_stamp),
  foreign key (uid) references user (uid)
);

CREATE TABLE cookie
(
  email varchar(190) not null,
  verify varchar(190) not null,
  primary key (email),
  foreign key (email) references user (email)
); 

CREATE TABLE post
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
  algo_value float,
  category varchar(190),
  scraped int(1) default 0,
  primary key (pid),
  foreign key (uid) references user (uid),
  fulltext (content)
); 

CREATE TABLE com
(
  cid int not null auto_increment,
  pid int,
  uid int,
  content text not null,
  tier int not null,
  main_parent int,
  parent int,
  vote int unsigned not null default 0,
  flagged int unsigned not null default 0,
  ip_address varchar(190),
  city varchar(190),
  region varchar(190),
  country varchar(190),
  comment_time datetime not null default now(),
  primary key (cid),
  foreign key (uid) references user (uid),
  foreign key (pid) references post (pid)
);

CREATE TABLE webdata
(
	wid int not null auto_increment,
	content text not null,
	summary text not null,
	title text not null,
	author varchar(190) not null,
	source varchar(190) not null unique,
	source_site varchar(190) not null,
	city varchar(190),
	region varchar(190),
	country varchar(190),
	get_time datetime not null default now(),
	primary key (wid)
);

CREATE TABLE tweet
(
  tid int not null auto_increment,
  username varchar(190) not null,
  user_id bigint not null,
  content varchar(190) not null,
  content_id bigint not null,
  longitude float not null,
  latitude float not null,
  tweet_time datetime not null,
  primary key(tid)
);

INSERT INTO user (username, password, email) VALUES ("anon", "anon", "anon");

SET GLOBAL event_scheduler = ON;
CREATE EVENT rating ON SCHEDULE EVERY 1 MINUTE DO UPDATE post SET algo_value = vote/POW((TIMESTAMPDIFF(second, post_time, now())/60/60) + 2, 1.5);

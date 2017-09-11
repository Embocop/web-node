ALTER TABLE trendgit.webdata 
ADD `added` INT(1) NULL DEFAULT '0';

ALTER TABLE trendgit.tweet
ADD `added` INT(1) NULL DEFAULT '0';

INSERT INTO trendgit.user (username, password, email) VALUES ("Twitter Bot", "Twitter Bot", "Twitter Bot");
INSERT INTO trendgit.user (username, password, email) VALUES ("NYTimes Bot", "NYTimes Bot", "NYTimes Bot");

DELIMITER $$
CREATE FUNCTION `distanceXY`(x1 decimal(10,6), y1 decimal(10,6), x2 decimal(10,6), y2 decimal(10,6)) RETURNS decimal(10,6)
    DETERMINISTIC
BEGIN
  DECLARE dist decimal(10,6);
  SET dist = 12742 * asin(sqrt(pow(sin((radians(x1) - radians(x2)) / 2), 2)
    + cos(radians(x2)) * cos(radians(x1)) * pow(sin((radians(y1)
    - radians(y2)) / 2), 2)));
  RETURN dist;
END$$

CREATE FUNCTION `trend`(post_time TIMESTAMP, vote INT, views INT) RETURNS decimal(12,4)
BEGIN
	DECLARE trend decimal(12,4);
    SET trend = TIMESTAMPDIFF(HOUR, post_time, now()) / ((1 + vote) *
		(1 + log10(1 + views)));
RETURN trend;
END$$
DELIMITER ;

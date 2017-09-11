#!/usr/bin/env bash

mysql -u root < tg.sql

# first 2 updates
cat ./updates/1.0[1-2]/update.sql | mysql -u root -D trendgit

# "worldcitiespop.txt" must be present from where you are running this command
mysql -u root -D trendgit --local-infile < ./updates/1.03/update.sql

# the rest of them
cat ./updates/[1-9].[0-9][4-9]/update.sql | mysql -u root -D trendgit

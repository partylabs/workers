#!/bin/sh

for project in ./packages/*; do
    (cd "$project" && ncu -u && npm install)
done

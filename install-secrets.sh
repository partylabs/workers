#!/bin/sh

for project in ./packages/*; do
    (cd "$project" && wrangler secret:bulk < ../../rpc-secrets.json)
done


#!/bin/bash
# This script is used to update the front end of the website
rm -rf src/whombat/statics/*
cd front
pnpm run build
mv out/* ../src/whombat/statics/

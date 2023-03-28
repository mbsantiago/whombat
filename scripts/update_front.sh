#!/bin/bash
# This script is used to update the front end of the website
rm -rf back/src/whombat/statics/*
cd front
pnpm run build
mv dist/* ../back/src/whombat/statics/

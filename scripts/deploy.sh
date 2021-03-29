#!/bin/bash

# exit if any of the command fails
set -e

# The bootstrap-demo source
SOURCE="/home/niketpathak/code/adRotator/bootstrap-demo"

# The production directory
TARGET="/var/www/html/rotator.niketpathak.com"

# Install and build App
npm ci
npm run prod

# Copy the demo directory to the target
# deleting previous site first
echo -e "Deleting Current Demo Site Assets and copying new assets => rm -Rf $TARGET && cp -R $SOURCE $TARGET"
rm -Rf $TARGET

# copy assets
cp -R $SOURCE $TARGET


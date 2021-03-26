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
# deleting
echo -e "Deleting Current Demo Site Assets => rm -Rf $TARGET"
rm -Rf $TARGET

echo -e "Copying Assets => cp -R $SOURCE $TARGET"
cp -R $SOURCE $TARGET


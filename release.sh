#!/bin/bash

git add .
git commit -m "release"
git push
git tag -d v1
git push origin --delete v1
git tag v1
git push origin --tags

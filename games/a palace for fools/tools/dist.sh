#!/bin/sh
cd "$(dirname "$0")"
cp ../lib/howler.core.min.js howler.core.min.js
cp -r ../assets assets
cp -r ../localization localization
java -jar closure.jar --js ../src/engine/*.js ../src/*.js --js_output_file out.js #--compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2018
cat html_up.txt > index.html
cat out.js >> index.html
cat html_down.txt >> index.html
zip -r ../dist.zip howler.core.min.js assets localization index.html

rm index.html
rm -rf assets
rm -rf howler.core.min.js
rm -rf localization
rm -rf out.js


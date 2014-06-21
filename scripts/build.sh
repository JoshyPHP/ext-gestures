#!/bin/bash

cd "$(dirname $(dirname $0))/build";
rm -f *.*
cp ../src/manifest.json ./

[ -f ../externs/chrome_extensions.js ] || wget --directory-prefix=../externs/ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/chrome_extensions.js

php -r "file_put_contents('manifest.json',json_encode(json_decode(file_get_contents('manifest.json'))));"

for file in ../src/*.js;
do
	java -jar /usr/local/bin/compiler.jar --compilation_level ADVANCED --externs ../externs/chrome_extensions.js --js "$file" --js_output_file "$(basename $file)" --use_types_for_optimization
done

kzip gestures.zip *
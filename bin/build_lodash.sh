cd ../flatiron
files=$(ag "_\.\w+" -o --coffee --nogroup --nofilename | ag ".+" | sort | uniq)
files=$(echo $files | sed 's/_.//g' | sed 's/ /,/g')

cd ../blowdash

lodash include=$files -d -o index.js

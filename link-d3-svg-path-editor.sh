set -ex
rm -rf node_modules/d3-svg-path-editor
mkdir node_modules/d3-svg-path-editor
cp ../d3-svg-path-editor/package.json node_modules/d3-svg-path-editor/
cp -r ../d3-svg-path-editor/src node_modules/d3-svg-path-editor/

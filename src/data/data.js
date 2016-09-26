var _ = require('lodash');
var path = require('path');
var fs = require('fs');

module.exports = function(file) {
  var filename = file.path.substr(0, file.path.lastIndexOf('.'));
  var filepath = path.join(__dirname, path.basename(filename));
  return _.assign(
    JSON.parse(fs.readFileSync(filepath + '.json')),
    JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json')))
  );
}

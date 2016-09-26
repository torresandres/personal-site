const _ = require('lodash');
const path = require('path');

module.exports = function(file) {
  return _.assign(
    require('./' + path.basename(file.path).split('.')[0] + '.json'),
    {pass_something: 'right here if needed'}
  );
}

// The Los Angeles file has dates with no colon or full number.  Need to clean that up to make match other datasets.

const fs = require('fs');
const data = fs.readFileSync('./los-angeles.csv', 'utf8');
const rows = data.split('\n');
let newFile = rows.shift() + '\n';

rows.forEach(row => {
  const columns = row.split(',');
  columns[1] = ('0000' + columns[1]).slice(-4);
  columns[1] = columns[1].slice(0, 2) + ':' + columns[1].slice(-2);
  newFile += columns.join(',') + '\n';
})

fs.writeFileSync('./new.csv', newFile);

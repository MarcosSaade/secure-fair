const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Proyectos Verano 202511.xlsx');
const wb = XLSX.readFile(filePath);
console.log('Sheets:', wb.SheetNames);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
console.log('Total rows:', data.length);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('\nFirst 3 rows:');
data.slice(0, 3).forEach((row, i) => {
  console.log(`Row ${i+1}:`, JSON.stringify(row, null, 2));
});

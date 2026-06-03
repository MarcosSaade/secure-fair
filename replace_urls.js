const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.js');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  const target1 = "`http://${window.location.hostname}:8000/api`";
  const target2 = "(process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000/api`)";
  const replacement = "`/api`";

  if (c.includes(target2)) {
    c = c.split(target2).join(replacement);
    changed = true;
  }
  if (c.includes(target1)) {
    c = c.split(target1).join(replacement);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, c);
  }
});

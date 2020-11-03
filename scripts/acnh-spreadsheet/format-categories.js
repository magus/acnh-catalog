const fs = require('fs');
const path = require('path');

function readJSON(filename) {
  const rawFileString = fs.readFileSync(filename).toString();
  return JSON.parse(rawFileString);
}

const sampleArray = (name, _) => console.warn(name, _.length, 'SAMPLE', JSON.stringify(_[0], null, 2));

// MAIN
const PREVIOUS_JSON = readJSON('./in/categories.json');
const SPREADSHEET_CATEGORIES = readJSON('./out/categories.json');

const NEW_JSON = {};

const previousGroups = {};
Object.keys(PREVIOUS_JSON).forEach((group) => {
  // console.debug({ group });
  NEW_JSON[group] = [];
  PREVIOUS_JSON[group].forEach((category) => {
    previousGroups[category] = group;
  });
});

SPREADSHEET_CATEGORIES.forEach((category) => {
  if (previousGroups[category]) {
    NEW_JSON[previousGroups[category]].push(category);
  } else {
    throw new Error(`NEW CATEGORY, add manually to in/categories.json [${category}]`);
  }
});

// console.debug({ NEW_JSON, previousGroups });

fs.writeFileSync('out/categories.json', JSON.stringify(NEW_JSON, null, 2));

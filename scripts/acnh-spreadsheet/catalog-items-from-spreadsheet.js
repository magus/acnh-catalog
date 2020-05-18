const fs = require('fs');
const path = require('path');

function keyByField(list, generateKey) {
  const map = {};
  list.forEach((item) => {
    map[generateKey(item)] = item;
  });
  return map;
}
function readJSON(filename) {
  const rawFileString = fs.readFileSync(filename).toString();
  return JSON.parse(rawFileString);
}
const sampleArray = (name, _) => console.warn(name, _.length, 'SAMPLE', JSON.stringify(_[0], null, 2));
const villagerDBUrlName = (str) =>
  str
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\.|\'|\(|\)/g, '');

// MAIN
const ACNH_SPREADSHEET = readJSON('./ACNH_SPREADSHEET.json');
sampleArray('ACNH_SPREADSHEET', ACNH_SPREADSHEET);

// {
//   "category": "Art",
//   "name": "Wistful Painting",
//   "name_slug": "wistful-painting",
//   "orderable": false,
//   "variant_slug": "real",
//   "variant": "Real",
//   "id": 11247
// }

const minimalItems = ACNH_SPREADSHEET.map((item) => {
  const { __id, name, sourceSheet: category, inventoryImage, image: variantImage, closetImage, albumImage } = item;

  let variant;
  if (item.variation && item.pattern) {
    variant = `${item.variation} / ${item.pattern}`;
  } else if (item.variation || item.pattern) {
    variant = item.variation || item.pattern;
  }

  const imageUrl = closetImage || albumImage || inventoryImage || variantImage;

  // // images?
  // if (!image) {
  //   console.error(item);
  //   process.exit(1);
  // }

  let image;
  if (imageUrl) {
    image = imageUrl.replace('https://acnhcdn.com/latest/', '');
  }

  return { id: __id, category, name, variant, image };
});

// validate output
const errors = [];
const validItems = [];
minimalItems.forEach((item) => {
  const err = (msg) => errors.push([msg, item]);

  // images?
  if (!item.image) return err('missing image');

  validItems.push(item);
});

console.debug('errors', errors);
// if (errors.length) {
//   console.debug('errors', errors);
//   process.exit(1);
// }

sampleArray('validItems', validItems);
fs.writeFileSync('validItems.json', JSON.stringify(validItems, null, 2));

const categories = new Set();
validItems.forEach((item) => {
  categories.add(item.category);
});
console.debug(categories);
fs.writeFileSync('categories.json', JSON.stringify([...categories], null, 2));

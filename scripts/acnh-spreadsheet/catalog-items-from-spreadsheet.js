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

// MAIN
const ACNH_SPREADSHEET = readJSON('./out/ACNH_SPREADSHEET.json');
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

function capitalize(text) {
  return (
    text
      // capitalize first character (\w) after each word start (\b)
      .replace(/\b\w/g, (_) => _.toUpperCase())
      // fix the 'S which results from above regex
      // e.g. admiral's photo > Admiral'S Photo
      .replace(/'S/g, "'s")
  );
}

const ERRORS = [];

const minimalItems = ACNH_SPREADSHEET.map((item) => {
  const {
    __id,
    name: originalName,
    sourceSheet: category,
    inventoryImage,
    image: variantImage,
    closetImage,
    albumImage,
    iconImage,
  } = item;

  let variant;
  if (item.variation && item.pattern) {
    variant = `${item.variation} / ${item.pattern}`;
  } else if (item.variation || item.pattern) {
    variant = `${item.variation || item.pattern}`;
  } else if (typeof item.genuine === 'boolean') {
    variant = item.genuine ? 'Real' : 'Fake';
  }

  let name;
  if (originalName) {
    name = capitalize(`${originalName}`);
  }

  const imageUrl = closetImage || albumImage || iconImage || inventoryImage || variantImage;

  // // images?
  // if (!imageUrl) {
  //   console.error(item);
  //   process.exit(1);
  // }

  let image;
  if (imageUrl) {
    // replace acnhcdn host and path with empty string
    // rebuild in apps with 'https://acnhcdn.com/latest/<image>'
    image = imageUrl.replace(/https\:\/\/acnhcdn\.com\/.*?\//, '');
  }

  const gItem = { id: __id, category, name, variant, image };

  // validate each generated item (gItem)
  const err = (msg, gitem) => {
    ERRORS.push([msg, item, gitem]);
  };
  // images?
  if (!gItem.image) return err('missing image', gItem);
  if (!gItem.name) return err('missing name', gItem);
  if (gItem.name && typeof gItem.name !== 'string') return err('name must be a string', gItem);
  if (gItem.variant && typeof gItem.variant !== 'string') return err('variant must be a string', gItem);

  return gItem;
});

console.debug('ERRORS', ERRORS);
fs.writeFileSync('out/ERRORS.json', JSON.stringify(ERRORS, null, 2));
if (ERRORS.length) {
  // process.exit(1);
}

// validate output
const UPDATED_ITEMS = minimalItems.filter((_) => !!_);
sampleArray('UPDATED_ITEMS', UPDATED_ITEMS);
fs.writeFileSync('out/items.json', JSON.stringify(UPDATED_ITEMS, null, 2));

const categories = new Set();
UPDATED_ITEMS.forEach((item) => {
  if (!item.category) {
    console.error('missing category', { item });
    throw new Error('missing category');
  }
  categories.add(item.category);
});
fs.writeFileSync('out/categories.json', JSON.stringify([...categories], null, 2));

// output new items (excluding errors) for logging into changelog
const NEW_ITEMS = readJSON('./out/NEW_ITEMS.json');
const ACNH_SPREADSHEET_LOOKUP = keyByField(ACNH_SPREADSHEET, (_) => _.uniqueEntryId);
const UPDATED_ITEMS_LOOKUP = keyByField(UPDATED_ITEMS, (_) => _.id);
const ERROR_LOOKUP = keyByField(ERRORS, (_) => _[1].uniqueEntryId);
console.debug('NEW_ITEMS');
NEW_ITEMS.forEach((_) => {
  if (ERROR_LOOKUP[_.uniqueEntryId]) {
    // console.error('error skip', { _ });
    // throw new Error('error skip');
    return;
  }

  // use spreadsheet data to lookup by uniqueEntryId
  // then use the simple catalog data to lookup by __id
  const spreadsheetItem = ACNH_SPREADSHEET_LOOKUP[_.uniqueEntryId];
  const item = UPDATED_ITEMS_LOOKUP[spreadsheetItem.__id];
  // console.debug({ spreadsheetItem, item });
  if (item) {
    console.debug('-', capitalize(item.name), item.variant ? `(${item.variant})` : '');
  }
});
console.debug('\n\n');
console.debug('***************************************************');
console.debug('**!!!**', 'Record new items in changelog', '**!!!**');

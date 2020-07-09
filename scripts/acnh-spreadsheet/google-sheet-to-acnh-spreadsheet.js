const fs = require('fs');
const path = require('path');

function keyByField(list, generateKey) {
  const map = {};
  list.forEach((item) => {
    const key = generateKey(item);
    if (!key) {
      console.error('unable to generate key', { item });
      throw Error('unable to generate key');
    }

    if (map[key]) {
      console.error('key already exists', { key });
      throw Error('key already exists');
    }

    map[key] = item;
  });
  return map;
}

function readJSON(filename) {
  const rawFileString = fs.readFileSync(filename).toString();
  return JSON.parse(rawFileString);
}

const sanitize = (raw) => raw.trim().toLowerCase();

const sampleArray = (name, _) => console.warn(name, _.length, 'SAMPLE', JSON.stringify(_[0], null, 2));

const CURRENT_ITEMS_JSON = readJSON('./in/ACNH_SPREADSHEET.json');
sampleArray('CURRENT_ITEMS_JSON', CURRENT_ITEMS_JSON);

const SPREADSHEET_ITEMS = readJSON('./in/items.json');
sampleArray('SPREADSHEET_ITEMS', SPREADSHEET_ITEMS);
const SPREADSHEET_CREATURES = readJSON('./in/creatures.json');
sampleArray('SPREADSHEET_CREATURES', SPREADSHEET_CREATURES);

const NEW_ITEMS = [];
const ACNH_SPREADSHEET = [];
const CURRENT_ITEMS_LOOKUP = keyByField(CURRENT_ITEMS_JSON, (_) => _.uniqueEntryId);

function buildACNHSpreadsheetItem(id = 'UNASSIGNED', item, variant) {
  const itemCopy = { ...item, __id: id };
  delete itemCopy.variants;

  Object.keys(itemCopy).forEach((itemKey) => {
    if (variant) {
      Object.keys(variant).forEach((variantKey) => {
        if (variantKey === itemKey) {
          console.error(itemCopy, variant);
          throw new Error('key collision');
        }
      });
    }
  });

  const builtItem = { ...itemCopy, ...variant };

  if (!builtItem.uniqueEntryId) {
    console.error(builtItem, item, variant);
    throw new Error('missing uniqueEntryId');
  }

  return builtItem;
}

[...SPREADSHEET_ITEMS, ...SPREADSHEET_CREATURES].forEach((sitem) => {
  function lookup(item, variant) {
    const key = (variant && variant.uniqueEntryId) || item.uniqueEntryId;
    const match = CURRENT_ITEMS_LOOKUP[key];

    if (match) {
      ACNH_SPREADSHEET.push(buildACNHSpreadsheetItem(match.__id, item, variant));
      return true;
    }

    NEW_ITEMS.push(buildACNHSpreadsheetItem('NEW', item, variant));
    return false;
  }

  if (!sitem.variants) {
    // no variants
    lookup(sitem);
  } else if (sitem.variants.length === 1) {
    // single variant, lookup by name
    lookup(sitem, sitem.variants[0]);
  } else {
    // variants, lookup each variant
    sitem.variants.forEach((variant) => {
      lookup(sitem, variant);
    });
  }
});

// We have built a map between spreadsheet and current data/items.json
// For any NEW_ITEMS, we can simply add them to the dataset and give them ids
// This will be our new source of truth!
sampleArray('NEW_ITEMS', NEW_ITEMS);
fs.writeFileSync('out/NEW_ITEMS.json', JSON.stringify(NEW_ITEMS, null, 2));

// generate a guid and assign unique id to new items
// with 3 from this char set (a-z,A-Z) (52 items)
// we reach 140,608 unique values (52 * 52 * 52)
function generateGUID(charCount = 3) {
  const chars = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  let id = '';
  for (let i = 0; i < charCount; i++) {
    const c = chars[Math.floor(Math.random() * chars.length)];
    id += c;
  }

  return id;
}

const ID_LOOKUP = {};

function generateUniqueGUID() {
  let id = generateGUID();
  while (ID_LOOKUP[id]) {
    id = generateGUID();
  }

  // save this new id to avoid repicking it
  ID_LOOKUP[id] = true;

  return id;
}

// Populate ID_LOOKUP with existing ids
ACNH_SPREADSHEET.forEach((_) => {
  ID_LOOKUP[_.__id] = true;
});

console.debug('ID_LOOKUP', Object.keys(ID_LOOKUP).length);

NEW_ITEMS.forEach((item) => {
  const __id = generateUniqueGUID();
  console.debug('adding new item', __id, item.name, item.variation, item.pattern, item.genuine);
  ACNH_SPREADSHEET.push({ ...item, __id });
});

const ACNH_SPREADSHEET_LOOKUP = keyByField(ACNH_SPREADSHEET, (_) => _.__id);

if (Object.keys(ACNH_SPREADSHEET_LOOKUP).length !== ACNH_SPREADSHEET.length) {
  console.debug(Object.keys(keyByField(ACNH_SPREADSHEET, (_) => _.__id)).length);
  console.debug(ACNH_SPREADSHEET.length);
  throw new Error('number of unique keys does not match number of items');
}

// Double check current items vs new generated ACNH_SPREADSHEET
CURRENT_ITEMS_JSON.forEach((item) => {
  const id = item.__id;
  if (!ACNH_SPREADSHEET_LOOKUP[id]) {
    console.warn(id, 'missing', { item });
  }
});

sampleArray('ACNH_SPREADSHEET', ACNH_SPREADSHEET);
fs.writeFileSync('out/ACNH_SPREADSHEET.json', JSON.stringify(ACNH_SPREADSHEET, null, 2));

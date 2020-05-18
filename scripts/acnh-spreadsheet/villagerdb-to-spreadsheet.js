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
const VILLAGER_DB_ITEMS = readJSON('./villagerdb-items.json');
sampleArray('VILLAGER_DB_ITEMS', VILLAGER_DB_ITEMS);

const SPREADSHEET_ITEMS = readJSON('./spreadsheet-items.json');
sampleArray('SPREADSHEET_ITEMS', SPREADSHEET_ITEMS);
const SPREADSHEET_CREATURES = readJSON('./spreadsheet-creatures.json');
sampleArray('SPREADSHEET_CREATURES', SPREADSHEET_CREATURES);

// Compare VILLAGER_DB_ITEMS to SPREADSHEET_ITEMS

// Find items NOT in SPREADSHEET_ITEMS but in VILLAGER_DB_ITEMS
// Any? Yes, 101. Mostly bugs and creatures, lets add those back into our spreadsheet dataset
// After including creatures? 21. Mostly hyphenated and Winter Solstice items, mapping key below
const spreadsheetLookup = keyByField(SPREADSHEET_ITEMS, (_) => _.name.toLowerCase());
const spreadsheetCreatureLookup = keyByField(SPREADSHEET_CREATURES, (_) => _.name.toLowerCase());
const notInSpreadsheet = [];
VILLAGER_DB_ITEMS.forEach((item) => {
  const match = spreadsheetLookup[item.name.toLowerCase()];
  const creatureMatch = spreadsheetCreatureLookup[item.name.toLowerCase()];
  if (!match && !creatureMatch) {
    notInSpreadsheet.push(item);
  }
});

sampleArray('notInSpreadsheet', notInSpreadsheet);
fs.writeFileSync('notInSpreadsheet.json', JSON.stringify(notInSpreadsheet, null, 2));

const SPREADSHEET_VILLAGERDB_MAP = {
  'oil-barrel bathtub': 'Oil Barrel Bathtub',
  'gold-screen wall': 'Gold Screen Wall',
  'handmade cape': 'Red Handmade Cape',
  'handmade crown': 'Red Handmade Crown',
  'white-brick wall': 'White Brick Wall',
  'summer-solstice crown': 'Yellow Summer-solstice Crown',
  'winter-solstice sweater': 'Beige Winter-solstice Sweater',
};

const SPREADSHEET_VILLAGERDB_VARIANT_MAP = {
  'diner chair': {
    aquamarine: 'sapphire',
  },
  'diner counter chair': {
    aquamarine: 'sapphire',
  },
  'diner counter table': {
    aquamarine: 'sapphire',
  },
  'diner dining table': {
    aquamarine: 'sapphire',
  },
  'diner mini table': {
    aquamarine: 'sapphire',
  },
  'diner sofa': {
    aquamarine: 'sapphire',
  },
  'diner neon clock': {
    'aquamarine / red lines': 'sapphire / red lines',
    'aquamarine / b & w numeral': 'sapphire / b & w numeral',
    'aquamarine / blue bee': 'sapphire / blue bee',
  },
  'lawn chair': {
    'red & white & blue': 'red white & blue',
  },
  'exit sign': {
    '←': 'left arrow',
    '→': 'right arrow',
    '← →': 'left and right arrows',
  },
};

const SPREADHSEET_VILLAGERDB_SKIP_NAME = {
  // not well supported in villagerdb, re-index with spreadsheet new items
  'standard umbrella stand': true,
  'pocket modern camper': true,
  'pocket vintage camper': true,
};

const SPREADHSEET_VILLAGERDB_SKIP_REGEX = [
  // wedding items not in villagerdb set
  /wedding/,
];

// Find items NOT in VILLAGER_DB_ITEMS but in SPREADSHEET_ITEMS
// Any?
// YES, 235 items found. e.g. Oil-barrel Bathtub, Wedding Arch
// With considering for SPREADSHEET_VILLAGERDB_MAP? 228 (-7 the size of mapping, expected)
// After being careful with variant.variation and variant.pattern fields it looks like ~289 unmatched
// Building SPREADSHEET_VILLAGERDB_VARIANT_MAP to account for discovered matches
// Building SPREADHSEET_VILLAGERDB_SKIP_NAME to account for skipped unmatches
// SPREADHSEET_VILLAGERDB_SKIP_REGEX skip anything that matches these regexes
// down to 200 items unaccounted for, seem to be no matches
const villagerDBLookup = keyByField(VILLAGER_DB_ITEMS, (_) =>
  _.variant ? `${_.name.toLowerCase()}${_.variant.toLowerCase()}` : _.name.toLowerCase(),
);
const notInVillagerDB = [];
const NEW_ITEMS = [];
const ACNH_SPREADSHEET = [];
SPREADSHEET_ITEMS.forEach((item) => {
  const spreadsheetItemName = item.name.toLowerCase();

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

  function lookup(lookupName, variant) {
    const match = villagerDBLookup[lookupName];
    if (match) {
      ACNH_SPREADSHEET.push(buildACNHSpreadsheetItem(match.id, item, variant));
      return true;
    }

    notInVillagerDB.push([spreadsheetItemName, lookupName]);
    NEW_ITEMS.push(buildACNHSpreadsheetItem('NEW', item, variant));
    return false;
  }

  function handleLookup(name) {
    function variantLookup(variantName, variant) {
      const variantNameLower = variantName.toString().toLowerCase();
      const variantMap = SPREADSHEET_VILLAGERDB_VARIANT_MAP[name];
      if (variantMap && variantMap[variantNameLower]) {
        // handle mapping
        return lookup(`${name}${variantMap[variantNameLower]}`, variant);
      }

      return lookup(`${name}${variantNameLower}`, variant);
    }

    if (item.variants.length === 1) {
      // single variant, lookup by name
      lookup(name, item.variants[0]);
    } else {
      // variants, lookup each variant
      item.variants.forEach((variant) => {
        // variant and pattern?
        if (variant.variation && variant.pattern) {
          variantLookup(`${variant.variation} / ${variant.pattern}`, variant);
        } else if (variant.variation || variant.pattern) {
          // one of variation or pattern
          variantLookup(variant.variation || variant.pattern, variant);
        } else if (typeof variant.genuine === 'boolean') {
          // art, variant is real/fake
          variantLookup(variant.genuine ? 'Real' : 'Fake', variant);
        } else {
          // console.error(item);
          // throw new Error('unhandled variant');
        }
      });
    }
  }

  if (!item.variants || item.variants.length === 0) {
    console.error(item);
    throw new Error('Unexpected item format must have variants');
  }

  if (item.sourceSheet === 'Photos') {
    // explicitly ignore photos
  } else if (SPREADHSEET_VILLAGERDB_SKIP_NAME[spreadsheetItemName]) {
    // explicitly skip these items
  } else if (SPREADHSEET_VILLAGERDB_SKIP_REGEX.some((regex) => regex.test(spreadsheetItemName))) {
    // explicitly skip any regex matches
  } else if (SPREADSHEET_VILLAGERDB_MAP[spreadsheetItemName]) {
    // map match, handle explicitly
    const villagerDBName = SPREADSHEET_VILLAGERDB_MAP[spreadsheetItemName];
    handleLookup(villagerDBName.toLowerCase());
  } else {
    handleLookup(spreadsheetItemName);
  }
});
sampleArray('notInVillagerDB', notInVillagerDB);
fs.writeFileSync('notInVillagerDB.json', JSON.stringify(notInVillagerDB, null, 2));

// We have build a map between spreadsheet and villagerdb
// With ~200 items not in the set, we can simply add them to the dataset and give them ids
// This will be our new source of truth!
sampleArray('NEW_ITEMS', NEW_ITEMS);
fs.writeFileSync('NEW_ITEMS.json', JSON.stringify(NEW_ITEMS, null, 2));

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

if (Object.keys(keyByField(ACNH_SPREADSHEET, (_) => _.__id)).length !== ACNH_SPREADSHEET.length) {
  console.debug(Object.keys(keyByField(ACNH_SPREADSHEET, (_) => _.__id)).length);
  console.debug(ACNH_SPREADSHEET.length);
  throw new Error('number of unique keys does not match number of items');
}

sampleArray('ACNH_SPREADSHEET', ACNH_SPREADSHEET);
fs.writeFileSync('ACNH_SPREADSHEET.json', JSON.stringify(ACNH_SPREADSHEET, null, 2));

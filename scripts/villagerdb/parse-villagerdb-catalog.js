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
const VILLAGER_DB_PATH = './villagerdb-master/data/items';

const itemFiles = fs.readdirSync(VILLAGER_DB_PATH);
sampleArray('itemFiles', itemFiles);

function parseItemFile(itemFile) {
  try {
    return readJSON(path.join(VILLAGER_DB_PATH, itemFile));
  } catch (err) {
    console.error('parseItemFile', 'invalid', err);
    process.exit(1);
  }
}

// Repeat for all item files
const NH_ITEMS = itemFiles.map(parseItemFile).filter((_) => _.games.nh);
sampleArray('NH_ITEMS', NH_ITEMS);

const VILLAGER_DB_ITEMS = [];
// build item by extracting necessary information
NH_ITEMS.map((_) => {
  const item = {};
  item.category = _.category;
  item.name = _.name;
  item.name_slug = _.id;

  // new horizons game data
  const nhData = _.games.nh;
  item.orderable = nhData.orderable;

  // Single variation items should not be included
  const variationSlugs = (nhData.variations && Object.keys(nhData.variations)) || [];
  if (variationSlugs.length > 1) {
    variationSlugs.forEach((variant_slug) => {
      const variant = nhData.variations[variant_slug];
      VILLAGER_DB_ITEMS.push({ ...item, variant_slug, variant });
    });
  } else {
    VILLAGER_DB_ITEMS.push(item);
  }
});

// Give each villagerdb item a unique numeric id
// NEW items will need to be given a new unique id and NEVER
// IDs assigned here will become final and reassigning ids will
// break any and saved item datasets
const CATEGORIES = new Set();
const VILLAGER_DB_ITEMS_IDS = VILLAGER_DB_ITEMS.map((item, id) => {
  CATEGORIES.add(item.category);
  return { ...item, id: id + 1 };
});

sampleArray('VILLAGER_DB_ITEMS_IDS', VILLAGER_DB_ITEMS_IDS);
fs.writeFileSync('villagerdb-items.json', JSON.stringify(VILLAGER_DB_ITEMS_IDS, null, 2));
fs.writeFileSync('villagerdb-categories.json', JSON.stringify([...CATEGORIES], null, 2));

// // Ok now the hard part....we need to compare VILLAGER_DB_ITEMS and ITEM_VARIANT_CATALOG (output of parse-acnh-catalog.js)
// // that means an item exists in ITEM_VARIANT_CATALOG but not in VILLAGER_DB_ITEMS
// // NOTE
// // Verified these items do not look legit
// // This means villagerdb is superset and can be authoratative going forward
// const ITEM_VARIANT_CATALOG = readJSON('./item-variants-catalog.json');
// sampleArray('ITEM_VARIANT_CATALOG', ITEM_VARIANT_CATALOG);
// const VILLAGER_DB_BY_NAME = keyByField(VILLAGER_DB_ITEMS, (_) => _.name.toLowerCase());
// const ITEM_VARIANT_CATALOG_BY_NAME = keyByField(ITEM_VARIANT_CATALOG, (_) => _.name.toLowerCase());

// const itemVariantCatalogErrors = [];

// ITEM_VARIANT_CATALOG.forEach((item) => {
//   if (!VILLAGER_DB_BY_NAME[item.name]) {
//     itemVariantCatalogErrors.push(item);
//   }
// });

// if (itemVariantCatalogErrors.length) {
//   itemVariantCatalogErrors.forEach((error) => {
//     console.error('404', JSON.stringify(error, null, 2));
//   });

//   console.error(itemVariantCatalogErrors.length, 'items 404d');
//   process.exit(1);
// }

const fs = require('fs');

const sanitize = (raw) => raw.trim().toLowerCase();
const keyMirror = function keyMirror(obj) {
  var ret = {};
  var key;
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = key;
    }
  }
  return ret;
};
function keyByField(list, key) {
  const map = {};
  list.forEach(item => {
    map[item[key]] = item;
  });
  return map;
}


const TYPES = keyMirror({
  tops: true,
  bottoms: true,
  onepiece: true,

  // headwear
  helmet: true,   // covers face
  cap: true,      // does not cover face

  accessory: true,
  socks: true,
  shoes: true,
  bag: true,
  umbrella: true,

  wallpaper: true,
  flooring: true,
  rug: true,
  fossil: true,
  music: true, // 'k.k. song'


  furniture: true, // ftr
  doordecoration: true, // housedoordeco
  tool: true,
});

const TYPES_RENAMES = {
  'k.k. song': TYPES.music,
  'ftr': TYPES.furniture,
  'housedoordeco': TYPES.doordecoration,
}

// MAIN

const catalogRaw = fs.readFileSync('./acnh-catalog.tsv');
const catalog = catalogRaw.toString();
const catalogLines = catalog.split('\n');

const ITEM_CATALOG = [];
const PARSED_TYPES = new Set();

catalogLines.forEach((line, id) => {
  if (!line) return;

  const [_type, _name, ..._variants] = line.split('\t')

  const rawType = sanitize(_type);
  const type = TYPES_RENAMES[rawType] || rawType;

  const name = sanitize(_name);

  const variants = _variants.map(sanitize);

  PARSED_TYPES.add(type);

  ITEM_CATALOG.push({ id: id + 1, type, name, variants })

  // // selectively log some for debugging
  // if (type === TYPES.doordecoration) {
  //   console.log({ type, name, variants });
  // }
});


// console.log('PARSED_TYPES', [...PARSED_TYPES]);

console.log('ITEM_CATALOG', ITEM_CATALOG.length, 'items');



fs.writeFileSync('item-catalog.json', JSON.stringify(ITEM_CATALOG, null, 2));
fs.writeFileSync('item-catalog-by-id.json', JSON.stringify(keyByField(ITEM_CATALOG, 'id'), null, 2));


// for each variant, create an item entry
const ITEM_VARIANTS_CATALOG = [];
let id = 1;
ITEM_CATALOG.forEach((item) => {
  const { type, name, variants } = item;
  // immediately add items with no variants
  if (variants.length === 0) return ITEM_VARIANTS_CATALOG.push({ id: id++, type, name });

  variants.forEach((variant) => {
    ITEM_VARIANTS_CATALOG.push({ id: id++, type, name, variant });
  });
});

console.log('ITEM_VARIANTS_CATALOG', ITEM_VARIANTS_CATALOG.length, 'items');

fs.writeFileSync('item-variants-catalog.json', JSON.stringify(ITEM_VARIANTS_CATALOG, null, 2))
fs.writeFileSync('item-variants-catalog-by-id.json', JSON.stringify(keyByField(ITEM_VARIANTS_CATALOG, 'id'), null, 2))

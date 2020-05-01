import React from 'react';

export default function Item({ item, name, variant, isCatalog, pending, onClick, onBuy, onDelete }) {
  const deleteButton = (pending || isCatalog) && (
    <button onClick={onDelete}>
      <span role="img" aria-label="delete">
        ❌
      </span>
    </button>
  );

  const buyButton = (pending || !isCatalog) && (
    <button className="no-padding" onClick={onBuy}>
      <span role="img" aria-label="buy" className="item-actions--buy" />
    </button>
  );

  const _name = name || item.name;
  const _variant = variant || item.variant;

  return (
    <div key={item.id} className="item" onClick={onClick}>
      <img className="item-image" src={getVillagerDBImage(item)} />

      <div className="item-name">
        <span dangerouslySetInnerHTML={{ __html: _name }} />
        <span
          dangerouslySetInnerHTML={{
            __html: !_variant ? '' : ` (${_variant})`,
          }}
        />
      </div>
      <div className="item-actions">
        {deleteButton}
        {buyButton}
      </div>
    </div>
  );
}

// Images from villagerdb
// e.g. 3D Glasses (white)  https://villagerdb.com/images/items/full/3d-glasses-vv-white.png
// e.g. No. 3 Shirt         https://villagerdb.com/images/items/medium/no-3-shirt.png

// Convert spaces to `-` and remove `.`
// e.g. `3d glasses` becomes `3d-glasses`
// e.g. `No. 3` becomes `No-3`
const villagerDBUrlName = (str) => str.replace(/\s/g, '-').replace(/\.|\'|\(|\)/g, '');
const getVillagerDBImage = (item) => {
  const { name, variant } = item;

  const sName = villagerDBUrlName(name);

  if (variant) {
    const sVariant = villagerDBUrlName(variant);
    return `https://villagerdb.com/images/items/full/${sName}-vv-${sVariant}.png`;
  }

  return `https://villagerdb.com/images/items/full/${sName}.png`;
};

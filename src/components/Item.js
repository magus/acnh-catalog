import React from 'react';

// Images from villagerdb
// e.g. 3D Glasses (white)  https://villagerdb.com/images/items/full/3d-glasses-vv-white.png
// e.g. No. 3 Shirt         https://villagerdb.com/images/items/medium/no-3-shirt.904cbc6.png

const getVillagerDBImage = (item) => {
  const { name, variant } = item;
  // Convert spaces to `-`
  // e.g. `3d glasses` becomes `3d-glasses`
  const hName = name.replace(/\s/g, '-').replace(/\./g, '');

  if (variant) {
    return `https://villagerdb.com/images/items/full/${hName}-vv-${variant}.png`;
  }

  return `https://villagerdb.com/images/items/full/${hName}.png`;
};
export default function Item({ item, name, variant, isCatalog, pending, onClick, onBuy, onDelete }) {
  const deleteButton = (pending || isCatalog) && (
    <button onClick={onDelete}>
      <span role="img" aria-label="delete">
        ❌
      </span>
    </button>
  );

  const buyButton = (pending || !isCatalog) && (
    <button onClick={onBuy}>
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

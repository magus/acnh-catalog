import React from 'react';

import Text from 'src/components/Text';
import Image from 'src/components/Image';

export default function Item({ item, name, variant, isCatalog, pending, onClick, onBuy, onDelete }) {
  const deleteButton = (pending || isCatalog) && (
    <button onClick={onDelete}>
      <div className="item-actions--delete" role="img" aria-label="delete">
        ❌
      </div>
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
      <Image className="item-image" src={getVillagerDBImage(item)} fallback="images/app-icon.3a3ded.svg" />

      <div className="item-name">
        <Text>
          <span dangerouslySetInnerHTML={{ __html: _name }} />
          <span
            dangerouslySetInnerHTML={{
              __html: !_variant ? '' : ` (${_variant})`,
            }}
          />
        </Text>
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
const getVillagerDBImage = (item) => {
  if (item.variant_slug) {
    return `https://villagerdb.com/images/items/full/${item.name_slug}-vv-${item.variant_slug}.png`;
  }

  return `https://villagerdb.com/images/items/full/${item.name_slug}.png`;
};

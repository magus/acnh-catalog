import React from 'react';

import Text from 'src/components/Text';
import Image from 'src/components/Image';
import CatalogIcon from 'src/components/icons/CatalogIcon';
import WishlistIcon from 'src/components/icons/Wishlist';
import preventBubble from 'src/utils/preventBubble';

export default function Item({ item, name, variant, isWishlist, isCatalog, isSearch, onClick, onWislist, onCatalog }) {
  const wishlistButton = !isCatalog && (
    <button onClick={preventBubble(onWislist)}>
      <WishlistIcon active={isWishlist} />
    </button>
  );

  const buyButton = (
    <button onClick={preventBubble(onCatalog)}>
      <CatalogIcon active={isCatalog} />
    </button>
  );

  const _name = name || item.name;
  const _variant = variant || item.variant;

  return (
    <div key={item.id} className="item" onClick={onClick}>
      <Image className="item-image" src={getS3Image(item)} fallback="images/app-icon.3a3ded.svg" />

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
        {wishlistButton}
        {buyButton}
      </div>
    </div>
  );
}

// e.g. https://accat-images.s3-us-west-1.amazonaws.com/thumb/apples-poster-235.png
const getS3Image = (item, type = 'thumb') => {
  const path = `https://accat-images.s3-us-west-1.amazonaws.com/${type}`;
  const filename = `${item.name_slug}${item.variant_slug ? '-' + item.variant_slug : ''}-${item.id}.png`;
  return `${path}/${filename}`;
};
// Images from villagerdb
// full / medium / thumb
// e.g. 3D Glasses (white)  https://villagerdb.com/images/items/full/3d-glasses-vv-white.png
// e.g. No. 3 Shirt         https://villagerdb.com/images/items/medium/no-3-shirt.png

// Convert spaces to `-` and remove `.`
// e.g. `3d glasses` becomes `3d-glasses`
// e.g. `No. 3` becomes `No-3`
const getVillagerDBImage = (item, type = 'thumb') => {
  if (item.variant_slug) {
    return `https://villagerdb.com/images/items/${type}/${item.name_slug}-vv-${item.variant_slug}.png`;
  }

  return `https://villagerdb.com/images/items/${type}/${item.name_slug}.png`;
};

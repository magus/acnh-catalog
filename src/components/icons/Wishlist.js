import React from 'react';

export default function Wishlist({ active, color }) {
  const fill = color || (active ? 'var(--error-color)' : 'var(--gray-color)');

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path
        fill={fill}
        d="M12.76 3.76a6 6 0 0 1 8.48 8.48l-8.53 8.54a1 1 0 0 1-1.42 0l-8.53-8.54a6 6 0 0 1 8.48-8.48l.76.75.76-.75zm"
      />
    </svg>
  );
}

# Animal Crossing New Horizons Catalog

## TODO

- remove copyright add note i have no claim etc to animal crossing


Animal Crossing is a registered trademark of Nintendo. This site has no claim to any intellectual property associated with Animal Crossing.

- fake loading bar, linear to 70% then increment by one every half second until 99% never hit 100

- "imp part" vs "part imp", are the indices arrays needing to be joined in sorted order and removing duplicates (set > array)

- focus input and (if necessary) scroll it into view after clicking search result (after scrolling down on search results we likely want to tap search and add another)

- allow faster input of multiple items, esp variations maybe by not dismissing search (remove reset input, add a settings dictionary that opens a simple modal with checkboxes to enable/disable "Clear search after adding items"

- we can hide catalog over 50 items, power users aren't scrolling it (we may want to consider virtualizing as well since we know item heights it should be easy)

- empty / no results showing up wrong for wishlist/catalog, use search OR filters.size to set empty boolean

- hasura backend for storing lists
  - triple dot menu for wishlist / catalog
  - show clear, import, share and compare
  - requires a backend to read/write eg hasura
  - <id, secret, version, list, name, timestamp>
  - generate and save secret to localStorage
  - when publishing id generated server side and returned, need to store this to allow writes to UPDATE the published list)
  - use same secret for all publishes done for that user
  - anyone read <id, version, name, list, timestamp>
  - only with secret can authorize write to row
  - share modal shows url to easily copy to clipboard
  - compare shows confirmation of name & timestamp ("compare WISHLIST (published <time ago> (date)")
  - require current version of list matches version to compare/import (This share was generated on an old version of Catalog. Ask the original owner to share their updates.

- add DIY flag (gamedata.recipe)
- add DIY filter button


- position transition for search results
  - https://www.framer.com/api/motion/examples/#position-transitions
- stagger animation for search results
  - https://www.framer.com/api/motion/types/#orchestration.staggerchildren

- Create an item update script
  - Go through our existing item database
  - Update existing items
  - Find any new items and log them out and assign them NEW ids
  - NEVER reassign ids (would break users who saved items)

- Move CSS variables to them (styled-components)

- Lighthouse CI Github Action
  - deploy to zeit, use preview url for lighthouse ci github action
    - https://hackernoon.com/how-to-run-lighthouse-performance-audit-using-github-actions-and-zeit-ff4738xm
  - https://github.com/treosh/lighthouse-ci-action
    - uses https://github.com/GoogleChrome/lighthouse-ci
  - diff lighthouse reports: https://googlechrome.github.io/lighthouse-ci/viewer/



- There is an invisible tagging system in the game that is used to sort items inside storage
  e.g. Sewing items, stuffed bears, kitchen items, etc.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app). To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js) - your feedback and contributions are welcome!


## Resources

[VillagerDB dataset](https://github.com/jefflomacy/villagerdb)

[Heroicons UI](https://github.com/sschoger/heroicons-ui)

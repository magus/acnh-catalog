# Animal Crossing New Horizons Catalog

## Launch

- bell icon and app icon need to be TRIPLED in pixel size so higher retina display shows better quality, the bells icon looks BLURRY on iphone. confirm using pixel count fixes things otherwise find a new bell icon on nookazon or villager db maybe

- persist wishlist, recent searches to local storage

- search optimization
  - lig blue
  does not match lighthouse (blue) properly
  above not matching because blue is matching too many items and not under the 200 limit
  increase limit to 1000 and observe query performance and compre against 200 limit


- instead of search placeholder text put in a random item from the entire catalog

- load source for image immediately to avoid any delay and give immediate results for cached images (otherwise it’s delayed by render > load > state > render cycle)
  - remove loading class entirely, just use error state to load fallback and do not do anything in successful load maybe?

- only show clear all button when more than 20 items are saved, show it at the BOTTOM of each catalog grouping and make it REQUIRE a confirmation with a DELAY before the confirm button is even PRESSABLE (super safe because it’s irreversible)

- search bar
  http://www.entypo.com/
  images/icons has svgs
  move clear button into search bar as visually small x with large tap target X icon
  add search icon attached to bar (straight border between)
  return key should blur input (might be default) just try removing keydown handler, otherwise code explicitly
  search button instead of return key
  show 5 most recent searches when the search bar is focused. each search should trigger a save to local storage. absolute position below the search bar, like below. initialize it with “suggested queries” but remove all the seeded initial “suggested queries” once the first real user search is performed by just saving that one in a fresh array. ensure no duplicates are stored, keep most recent at the top and ensure we always unshift in new items then slice(0,5) to truncate to most recent 5
  try using green and lighter green background for highlighting the bold next in variants. use a custom span tag with class to style weight, color and a light background

- footer and github readme note to villagerdb, icons and nintendo thanking


- Remove source maps
- Open Graph tags for SEO
  - Demo image with search results and description etc for nice cards
- Double check light and dark themes look ok
- Google Analytics

- use villagerdb dataset to check and enhance my dataset
- https://github.com/jefflomacy/villagerdb/blob/master/data/items/3d-glasses.json
  - A lot of items have variants that do not match villager db
  - e.g. Nose Drip, Laptop, Floor Lamp

  - script to automate collating datasets
  WARN items in tsv but NOT in villagerdb
  INFO items in villagerdb but NOT in tsv
  run from a zip download to make it easy to reproduce dataset and update it if needed



## TODO

- Move CSS variables to them (styled-components)

- Lighthouse CI Github Action
  - deploy to zeit, use preview url for lighthouse ci github action
    - https://hackernoon.com/how-to-run-lighthouse-performance-audit-using-github-actions-and-zeit-ff4738xm
  - https://github.com/treosh/lighthouse-ci-action
    - uses https://github.com/GoogleChrome/lighthouse-ci
  - diff lighthouse reports: https://googlechrome.github.io/lighthouse-ci/viewer/



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

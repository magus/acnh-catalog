# Animal Crossing New Horizons Catalog

## Launch

- validate and test open graph tags for SEO
  - send in dm on twitter to self
  - https://cards-dev.twitter.com/validator
  - https://developers.facebook.com/tools/debug/
  - https://opengraphcheck.com/



## TODO

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

# ACNH Spreadsheet

`google-sheets-to-json` contains scripts to pull from Google Sheets via API

Originally from https://github.com/NooksBazaar/google-sheets-to-json

## Runbook

- Inside `scripts/acnh-spreadsheet/in` gather inputs for running catalog update

  - Get latest spreadsheet items

    - `cd scripts/acnh-spreadsheet/google-sheets-to-json`
    - `rm -rf cache`
    - `node build`

    - **IMPORTANT**
      - Be sure to remove the `cache` otherwise you will get old results
      - `400 Bad request`, refresh `credentials.json`, instructions in `README.md` under **Setup**

    - Copy the items below into `scripts/acnh-spreadsheet/in`
      - `out/items.json`
      - `out/creatures.json`

  - Now we need to copy the previous catalog spreadsheet database
  - Copy into `scripts/acnh-spreadsheet/in` from `data-backup/`
    - `ACNH_SPREADSHEET.json`
    - `categories.json`

- Run the catalog update scripts (`scripts/acnh-spreadsheet`)
  - `node google-sheet-to-acnh-spreadsheet.js`
  - `node catalog-items-from-spreadsheet.js`
  - `node format-categories.js`

- **IMPORTANT** Copy the new item output into `CHANGELOG.md`

- Generated files are in `scripts/acnh-spreadsheet/out`

  - `ACNH_SPREADSHEET.json` contains the updated master item json (spreadsheet + existing current `items.json`)
  - `ERRORS.json` contains the items which are invalid (missing images, etc.)

    - **IMPORTANT** `ERRORS.json` should be very small (e.g. 3 music items)
    - If there are many errors, check why
    - Missing images?
      - Update `imageUrl` inside `minimalItems` `map` function to include new image keys
      - e.g. Added `storageImage` on 2021-12-19

  - `items.json` contains the new catalog
  - `categories.json` contains the new catalog categories

- **IMPORTANT** Add new timestamped `items.json` and `categories.json` to `public/data`

- **IMPORTANT** Replace references to `public/data/*` with new timestamped json files

  - **CTRL+SHIFT+F** for `2021-12-19-` and replace all with new timestamped data files

  - `src/components/Filters.js`
  - `src/pages/Search/index.js`
  - `src/pages/Search/Search.js`

## History

### 2021-12-19

- 551 new items, 15609 total items
- Update Runbook above for updating catalog items from spreadsheet items
- Error when trying to `yarn deploy:prod`; see `next.config.js` notes on `service-worker.js`
- Delete `service-worker.js` to allow `yarn build` to run

  ```sh
  rm public/service-worker.js
  yarn build
  ```
- Now we can link generated `service-worker.js` to `public` folder

  ```sh
  ln -s $PWD/.next/static/service-worker.js public
  ```

### 2020-11-03

- 15088 items
- Update Runbook above for updating catalog items from spreadsheet items
- Fall 🍁🎃 & Halloween 👻 items

### 2020-07-08
- 14903 items
- Update Runbook above for updating catalog items from spreadsheet items
- Uses existing `ACNH_SPREADSHEET.json` to compare `uniqueEntryId` values
- Mostly sea creatures, mermaid and pirate items

### May 17, 2020
- Initially we used data from villagerdb and moved to the community ACNH spreadsheet
- `villagerdb-to-spreadsheet.js` was used to parse, compare and reconcile this migration
- `catalog-items-from-spreadsheet.js` was used to filter the exhaustive `ACNH_SPREADSHEET.json` output to minimal set


## Resources

- acnh database: https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4/edit#gid=1316241644
- editors copy: https://docs.google.com/spreadsheets/d/1mo7myqHry5r_TKvakvIhHbcEAEQpSiNoNQoIS8sMpvM
- parsing out to json: https://github.com/acdb-team/google-sheets-to-json/blob/master/src/index.ts
- acnh cdn of image assets: https://acnhcdn.com/

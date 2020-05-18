# ACNH Spreadsheet

## TODO

- run on latest sheet, compare against existing, output differences and generate new
- includes images for items we can reuse
- donate to cdn after successful setup https://acnhcdn.com/

## Guide

- `scripts/acnh-spreadsheet/google-sheets-to-json` contains scripts build using `yarn build`
- Copied output from `scripts/acnh-spreadsheet/google-sheets-to-json/build` to `scripts/acnh-spreadsheet/export-spreadsheet`
- Visit [Google Sheets API Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) and click `Enable the Google Sheets API` to create `credentials.json`
- Copy `credentials.json` to `scripts/acnh-spreadsheet/export-spreadsheet` in order to authenticate the script
- `cd export-spreadsheet` and run `node index.js`


## History

### May 17, 2020
- Initially we used data from villagerdb and moved to the community ACNH spreadsheet
- `villagerdb-to-spreadsheet.js` was used to parse, compare and reconcile this migration
- `catalog-items-from-spreadsheet.js` was used to filter the exhaustive `ACNH_SPREADSHEET.json` output to minimal set


## Resources

- acnh database: https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4/edit#gid=1316241644
- editors copy: https://docs.google.com/spreadsheets/d/1mo7myqHry5r_TKvakvIhHbcEAEQpSiNoNQoIS8sMpvM
- parsing out to json: https://github.com/acdb-team/google-sheets-to-json/blob/master/src/index.ts
- acnh cdn of image assets: https://acnhcdn.com/

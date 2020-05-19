# ACNH Spreadsheet

## Guide

- `google-sheets-to-json` contains scripts to pull from Google Sheets via API

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

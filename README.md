# SD XC

South Dakota high school cross country rankings and race simulator.

**Live:** https://dan-burk.github.io/sdxc/

- **Rankings** — weekly blended rankings by year, week, gender and class, with rank movement from the previous week.
- **Race Simulator** — pick schools and a scoring class to get a projected finish order and team scores. SD scores 3 of up to 5 runners in Class B, 4 of 6 in A, and 5 of 7 in AA; teams without enough runners don't score.

## Data

The rankings are produced by the sister repo **sdxc-data**, whose `export.r` writes into `data/` here:

| File | Contents |
|---|---|
| `manifest.json` | Current season and the latest scored week per year. The app reads this to decide which years and weeks to show. |
| `{boys,girls}_{year}_week{n}.json` | One ranking snapshot per week. |
| `schools_{year}.json` | Schools and their class for that season. |

Don't edit these by hand; `export.r` overwrites them. The deployed site fetches them live from `raw.githubusercontent.com`, so a data push goes live without a redeploy.

## Development

```sh
npm install
npm run dev     # http://localhost:3000, reads the local data/ folder
npm run build   # type check + production build
```

Pushes to `master` that touch the app deploy to GitHub Pages via `.github/workflows/deploy.yml`.

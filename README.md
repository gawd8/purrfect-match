# Purrfect Match? — DSC 209R Initial Prototype

An early interactive explorable explanation using actual historical cat outcome records from Austin Animal Center, 2014–2024 complete calendar years.

## Files
- `index.html` — entire page and required rubric write-up (2 headings, 5 sentences each)
- `styles.css` — responsive styles
- `app.js` — D3.js interactive chart rendering and linked filter state
- `data/cat_outcomes_aggregated.csv` — real outcome counts by year, age group, and coat group (pre-aggregated from source CSV to keep GitHub Pages lightweight)

## Deploy (GitHub Pages)
1. Create a **public** GitHub repo, for example `purrfect-match`.
2. Upload **everything inside this folder** to the **root** of your new repo; keep the `data` directory and file under it. Avoid putting the entire containing folder one level down.
3. In GitHub repo > Settings > Pages, choose **Deploy from a branch**, `main`, `/ (root)`, Save.
4. The resulting GitHub Pages link will usually be `https://YOUR-USERNAME.github.io/purrfect-match/` (check the actual Pages Settings for the authoritative URL).
5. Test the URL in an incognito window: chart bars, filters, interactive click and Reset should all respond, and the write-up should be visible.
6. On Canvas submit your **actual published Pages URL** and your **write-up document** if the text box asks for both. This project also displays the eight-or-more required write-up sentences on the web page itself.

## Local testing
From the project root run `python3 -m http.server 8000` and open `http://localhost:8000/` in a browser. `file://` directly is not sufficient for `d3.csv` due to browser security rules.

## Method / scope
Source: [Austin Animal Center Outcomes (historical archive)](https://data.austintexas.gov/d/9t4d-g238), exported 173,775 rows from City of Austin Open Data. For this prototype we exclude years 2013 and 2025, which are partial years. We define age categories using the proposal notebook: kitten <1, adult 1–<8, senior 8+, and an Unknown group. Coat category is based on the first reported color token with slash-separated mixed colors kept distinct; less frequent categories collapse to `Other coats`. Each group stores `n` outcome records with known outcome type and `adopted` of those where outcome type is exactly `Adoption`. Counts may include repeated Animal IDs, and `Transfer` does not mean a failed adoption. These charts describe correlations, not causes.

## Note about course feedback
The professor's approval of solo work is distinct from approval of an outside dataset. If the external dataset is not yet explicitly approved, confirm the proposal feedback; this prototype assumes it is acceptable to proceed provisionally.

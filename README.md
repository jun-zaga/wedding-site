# Jordan & Alexandra Wedding Website

This is the full React/Vite project with the Honeymoon Fund section added.

## Honeymoon fund
- Venmo username: `@junzaga22`
- Button destination: `https://venmo.com/junzaga22`
- No progress bar.

## Registry
The Amazon Registry button points to the current wedding registry.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## IMPORTANT: photos
The source code expects the existing wedding photos in `public/photos/`.

When you copy this project over your existing project, **keep your current `public/photos` folder**.
This ZIP intentionally does not replace your real engagement photos because the uploaded project ZIP was not exposed to the coding runtime.

Expected filenames:
- hero-lake.jpg
- story-portrait.jpg
- bridge-kiss.jpg
- champagne-pour.jpg
- champagne-toast.jpg
- bridge-embrace.jpg
- proposal.jpg
- lakeside-lift.jpg
- lakeside-dip.jpg
- ring-hands.jpg
- lakeside-spin.jpg
- lake-embrace.jpg

## RSVP maintenance

The active page uses `src/components/RsvpSection.tsx`. Mixed-surname invitations collect an address per attending named guest. Same-surname families share one mailing address. Added guests also get individual addresses. The Guests sheet should contain one row per named guest with their First Name and Last Name; the invitation label is only a grouping label. Reserved Seats are summed across the invitation rows (do not repeat the full party allowance on each row).

Run `npm test` for RSVP regression checks and `npm run build` for production validation.

Deploy the updated `google-apps-script/Code.gs` as a new version of the existing Google Apps Script web app, then publish the website build. Both updates are needed. No deployment or live RSVP writes are performed by the tests. Newly saved addresses use structured JSON in the Guests Address column to preserve address fields on return; older free-text addresses require guests to fill the separate city/state/ZIP fields.

Responses are appended as history; use the latest response per Guest ID. Additional guest names and notes are stored in responses but are not prefilled on a later visit, so guests updating an RSVP must re-enter them.

# Wedding Website Starter

A responsive React + TypeScript wedding website starter designed for deployment on Vercel.

## Included

- Hero section and countdown
- Our Story section
- Venue, dress code, and travel details
- Wedding-day schedule
- Custom registry cards
- RSVP form demo
- FAQ section
- Responsive mobile navigation

## Run locally

1. Install Node.js 20 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local address shown by Vite.

## Customize first

Edit `src/App.tsx` to change:

- Names
- Date
- Location
- Venue
- Schedule
- Registry products
- FAQ answers

Edit `src/styles.css` to change:

- Colors in the `:root` section
- Fonts
- Spacing
- Card shapes
- Mobile layout

## Connect RSVP to Google Sheets

The current form only displays a local confirmation. The next step is to:

1. Create a Google Sheet.
2. Add a Google Apps Script web app.
3. Replace `handleSubmit` in `src/App.tsx` with a `fetch()` request to the Apps Script URL.

Do not place private Google credentials in the frontend.

## Deploy with Vercel

1. Upload this project to a GitHub repository.
2. Sign in to Vercel.
3. Import the repository.
4. Keep the detected Vite defaults.
5. Deploy.

Vercel will automatically redeploy whenever you push changes to GitHub.

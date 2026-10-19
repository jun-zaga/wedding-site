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

Guests now has exactly six columns: Guest ID, First Name, Last Name, Invitation Group, RSVP Status, Attending?. Keep these header names and the Guests tab name.

Each person has one permanent, unique ID. The website displays only the rows in an invitation group. Blank groups represent individual invitations. There is no public Add Guest option and no editable seat count.

Only allow a plus-one when intended: add a row with a new Guest ID, First Name `Plus one`, blank Last Name, and the same nonblank Invitation Group as the host. Do not add that row for guests without a plus-one. A named partner can simply have their own named row. An attending unnamed guest must enter first and last names. The existing row is updated and retains its ID.

Every invitation member must explicitly choose Attending or Not attending. The script writes Accepted/Declined in RSVP Status and Yes/No in Attending?. Unused plus-ones remain as rows marked Declined/No and can be used on a later response. Guest IDs and invitation membership are checked on the server.

The form does not ask for mailing addresses. RSVP Responses logs one row per invited person per submission, including their Guest ID, first and last name, invitation group, RSVP status and attendance. Optional dietary restrictions, song requests and messages apply to the invitation and are repeated on its guest rows. Use the latest Timestamp per Guest ID for the current response, or use Guests for the current attendance list. The script preserves existing response history and does not write address data.

### Activate the update

1. Back up your live Google Sheet. Replace its Guests tab with the Guests tab from Wedding-updated.xlsx, preserving the six header names. The remaining planning tabs can stay as they are. Existing IDs G001–G174 are preserved, and 20 previously unnumbered people now have IDs G175–G194. Brooklyn’s unnamed boyfriend remains G148, now labeled Plus one. No other plus-one permissions were added.
2. Add the RSVP Responses tab from RSVP-Responses-only.xlsx if starting with an empty response log. If you already have real responses, keep the existing tab and its history; the script adds any missing headers automatically. Replace the source in the existing Google Apps Script project with google-apps-script/Code.gs. Deploy a new version of the existing web app so its /exec URL stays unchanged. Keep its existing access settings.
3. Publish the updated site using the existing GitHub Pages workflow. Both the sheet/script update and the website update are required. The new script rejects the old guest schema with a clear setup message.
4. Check a solo invitation, a family invitation, and an invitation with an explicit plus-one. Tests use simulated Sheets and never write live RSVPs.

Run npm test and npm run build for verification. The local update has not deployed the Google Apps Script or changed the live Google Sheet.

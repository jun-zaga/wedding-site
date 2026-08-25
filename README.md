# Jordan & Alexandra Wedding Website

React + TypeScript + Vite wedding website for Jordan & Alexandra.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.

The RSVP Google Apps Script source is kept in `google-apps-script/Code.gs` and must be deployed separately in Google Apps Script when changed.


## RSVP address rules
- Families and invitation groups with different last names collect a separate mailing address for each attending person.
- Other invitations collect one shared mailing address.
- Declining guests are not asked for an address.
- After changing `google-apps-script/Code.gs`, redeploy the existing Google Apps Script web app so the live RSVP uses the new logic.

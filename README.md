# Flemme de Host

A simple homepage listing personal projects hosted online, with a favicon and description for each.

## Run locally

Built with [Next.js](https://nextjs.org). Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. For production: `npm run build && npm start` (or just import the repo on Vercel).

## Add a project

Edit [projects.json](projects.json) and add an entry (the page is rebuilt with it):

```json
{
  "name": "Project Name",
  "url": "https://example.com",
  "desc": "Short description (optional)"
}
```

### Project logos

Drop a square image in [public/logos/](public/logos/) named after the project's slug (lowercase, no apostrophes, spaces → `-`): `MCU's Order` → `mcus-order.png`. `.svg`, `.png`, `.webp` and `.jpg` are picked up at build time. To use another path, set `"logo": "/logos/whatever.png"` on the entry. Without a logo, the card shows the project's initials.

## Contributing

Contributions are welcome via Pull Requests.

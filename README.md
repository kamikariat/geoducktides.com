# Geoduck Tides - Tomales Bay

Interactive tide chart for Tomales Bay entrance, featuring detailed tide information with special emphasis on negative tides ideal for geoduck harvesting and tidepooling.

## Features

- Month-long tide visualization
- Multiple view modes (monthly, weekly, daily range, negative tides, daylight)
- Interactive charts with detailed tooltips
- Moon phases and sunrise/sunset data
- Highlighting of sub-zero tides

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

## Deploy to Vercel

The easiest way to deploy this Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Alternatively, deploy using the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- Next.js 15 (App Router)
- React 18
- Recharts for data visualization

## Data Sources

- Tide data: USHarbors.com
- Sunrise/Sunset: timeanddate.com
- Location: Tomales Bay entrance, CA

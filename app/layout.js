export const metadata = {
  title: 'Geoduck Tides - Tomales Bay',
  description: 'Tide information for Tomales Bay entrance, featuring negative tides ideal for geoduck harvesting and tidepooling',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}

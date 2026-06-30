import './globals.css';

export const metadata = {
  title: 'BhaktiSetu - Book Sacred Pujas Online',
  description: 'Book verified Vedic pujas from trusted temples with secure tracking and owner-controlled operations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

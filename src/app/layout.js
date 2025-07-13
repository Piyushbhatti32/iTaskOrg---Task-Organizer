import { metadata, viewport, themeColor } from './metadata';
import ClientLayout from './ClientLayout';

export { metadata, viewport, themeColor };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

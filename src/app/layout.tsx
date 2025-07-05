import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'AviHire',
  description: 'Aviation job board powered by Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

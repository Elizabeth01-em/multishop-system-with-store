// src/app/layout.tsx
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'MultiShop - Your One-Stop Shop for Everything',
  description: 'Discover amazing products from our curated collection',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeRegistry>
            <Layout>
              {children}
            </Layout>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
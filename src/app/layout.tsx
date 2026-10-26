import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Apex Property - Apartment Inventory & Asset Management System',
  description: 'Full-stack enterprise property asset register, multi-owner portfolio management, maintenance work orders, and inventory tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Determine theme from storage or default to light per user request
                  var stored = localStorage.getItem('apex_inventory_theme');
                  var theme = stored === 'dark' ? 'dark' : 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }

                  // Cleanup tracking extension artifacts
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName) {
                        var name = m.attributeName;
                        if (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0) {
                          m.target.removeAttribute(name);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, { attributes: true, subtree: true });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

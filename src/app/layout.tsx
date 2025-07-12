import './globals.css'
import { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import Script from 'next/script'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://devanddebate.com'),
  title: {
    template: '%s | Dev & Debate',
    default: 'Dev & Debate - Blogging Tool'
  },
  description: 'AI-powered blog generation tool by Dev & Debate. Create engaging, high-quality blog posts with advanced AI assistance.',
  icons: {
    icon: [
      { url: '/images/logo-main.png', sizes: 'any' },
      { url: '/images/logo-main.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/images/logo-main.png',
  },
  openGraph: {
    title: 'Dev & Debate - Blogging Tool',
    description: 'AI-powered blog generation tool. Create engaging, high-quality blog posts with advanced AI assistance.',
    url: 'https://devanddebate.com',
    siteName: 'Dev & Debate',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dev & Debate - Blogging Tool',
    description: 'AI-powered blog generation tool',
    creator: '@devanddebate',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo-main.png" sizes="any" />
        <link rel="icon" href="/images/logo-main.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo-main.png" />
        <link rel="apple-touch-icon" href="/images/logo-main.png" />
      </head>
      <body 
        className={`min-h-screen bg-black text-white antialiased ${dmSans.variable}`}
        suppressHydrationWarning={true}
      >
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
  title: '🍱 점심 뭐먹지',
  description: '오늘 점심 메뉴를 골라보세요',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gmarket+Sans:wght@300;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

export const metadata = {
  title: 'Sanity Studio',
  description: 'Панель управления сайтом',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning лечит ошибку разницы lang="en" и lang="ru" между сервером и браузером
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

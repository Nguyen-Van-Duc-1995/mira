import './globals.css';

export const metadata = {
  title: 'Mira World ♡ | Gửi yêu thương',
  description: 'Mira World — nơi gửi những lời chúc, yêu thương và năng lượng tích cực.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

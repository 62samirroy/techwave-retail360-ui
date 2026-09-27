import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Account',
  description:
    'Join Royal Saree & Family for exclusive previews of masterweaver handloom drops, personalized bridal styling, and fast express checkout.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

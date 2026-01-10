import React from 'react';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex-1 bg-neutral-50 dark:bg-[#001e27]">
      {children}
    </section>
  );
}

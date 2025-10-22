import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maintenance en cours – Chanvre Vert',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#0b0f1a',
      color: '#f8fafc',
    }}>
      <div style={{
        maxWidth: 720,
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Site en maintenance
        </h1>
        <p style={{ opacity: 0.85, marginBottom: '1.25rem' }}>
          Nous rencontrons un problème technique et travaillons activement à le résoudre.
          Merci pour votre patience.
        </p>
        <p style={{ fontSize: '0.95rem', opacity: 0.7 }}>
          Revenez dans quelques heures. Si le problème persiste, contactez-nous à
          {' '}<a href="mailto:contact@chanvre-vert.fr" style={{ color: '#60a5fa', textDecoration: 'underline' }}>contact@chanvre-vert.fr</a>.
        </p>
      </div>
    </main>
  )
}

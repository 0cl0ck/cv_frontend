export const dynamic = 'force-dynamic'

import ReferralClient from './ReferralClient'

export default async function Page() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <ReferralClient />
    </div>
  )
}

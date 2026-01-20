import Image from 'next/image'
import { Linkedin, Award, ExternalLink } from 'lucide-react'

/**
 * ExpertAuthorCard Component
 * 
 * Displays the expert author's profile for E-E-A-T (Experience, Expertise, 
 * Authoritativeness, Trust) compliance on pSEO pages.
 * 
 * This component signals to Google that the content is written by a real,
 * credentialed individual, which is critical for YMYL content.
 */

// Type matching the PayloadCMS ExpertAuthors collection
interface ExpertAuthor {
  id: string
  name: string
  role: string
  bio: string
  photo: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  linkedInUrl?: string | null
  websiteUrl?: string | null
  credentials?: Array<{
    title: string
    year?: number | null
  }> | null
  expertise?: Array<'cbd' | 'wellness' | 'nutrition' | 'regulation' | 'quality'> | null
}

interface ExpertAuthorCardProps {
  author: ExpertAuthor
  /**
   * Display variant:
   * - 'header': Compact horizontal layout for article headers
   * - 'sidebar': Vertical layout for sidebar placement
   * - 'full': Full profile card with all details
   */
  variant?: 'header' | 'sidebar' | 'full'
  className?: string
}

// Expertise labels for display
const EXPERTISE_LABELS: Record<string, string> = {
  cbd: 'CBD & Chanvre',
  wellness: 'Bien-être',
  nutrition: 'Nutrition',
  regulation: 'Réglementation',
  quality: 'Qualité & Labo',
}

export function ExpertAuthorCard({
  author,
  variant = 'header',
  className = '',
}: ExpertAuthorCardProps) {
  // Header variant - compact horizontal (for dark backgrounds)
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={author.photo.url}
            alt={author.photo.alt || `Photo de ${author.name}`}
            fill
            className="rounded-full object-cover ring-2 ring-white/20"
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {author.name}
            </span>
            {author.linkedInUrl && (
              <a
                href={author.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EFC368] hover:text-[#d3a74f]"
                aria-label={`Profil LinkedIn de ${author.name}`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-white/70 truncate">{author.role}</p>
        </div>
      </div>
    )
  }

  // Sidebar variant - vertical compact
  if (variant === 'sidebar') {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex flex-col items-center text-center">
          <div className="relative h-20 w-20 mb-3">
            <Image
              src={author.photo.url}
              alt={author.photo.alt || `Photo de ${author.name}`}
              fill
              className="rounded-full object-cover ring-2 ring-white shadow-sm"
              sizes="80px"
            />
          </div>
          <h3 className="font-medium text-gray-900">{author.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{author.role}</p>
          {author.linkedInUrl && (
            <a
              href={author.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-3 whitespace-pre-line">{author.bio}</p>
      </div>
    )
  }

  // Full variant - complete profile card
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-6 shadow-sm ${className}`}
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="flex items-start gap-5">
        {/* Photo */}
        <div className="relative h-24 w-24 flex-shrink-0">
          <Image
            src={author.photo.url}
            alt={author.photo.alt || `Photo de ${author.name}`}
            fill
            className="rounded-xl object-cover"
            sizes="96px"
            itemProp="image"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900" itemProp="name">
              {author.name}
            </h3>
            {author.linkedInUrl && (
              <a
                href={author.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
                aria-label={`Profil LinkedIn de ${author.name}`}
                itemProp="sameAs"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {author.websiteUrl && (
              <a
                href={author.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
                aria-label={`Site web de ${author.name}`}
                itemProp="url"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-green-700 font-medium mb-2" itemProp="jobTitle">
            {author.role}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line" itemProp="description">
            {author.bio}
          </p>
        </div>
      </div>

      {/* Credentials */}
      {author.credentials && author.credentials.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Award className="h-3.5 w-3.5" />
            Certifications
          </h4>
          <ul className="flex flex-wrap gap-2">
            {author.credentials.map((credential, index) => (
              <li
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {credential.title}
                {credential.year && (
                  <span className="text-gray-400 ml-1">({credential.year})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expertise tags */}
      {author.expertise && author.expertise.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5">
            {author.expertise.map((exp) => (
              <span
                key={exp}
                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
              >
                {EXPERTISE_LABELS[exp] || exp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpertAuthorCard

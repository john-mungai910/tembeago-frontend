/**
 * RecommendationCard.jsx
 * ----------------------
 * Full-featured vendor recommendation card with:
 * - Featured badge for premium vendors
 * - Multiple image thumbnails
 * - Visual star rating
 * - Package details with season + duration
 * - Category icons
 * - Prominent pricing
 */

import { useState } from 'react'

// Category icons
const CATEGORY_ICONS = {
  hotel:               '🏨',
  accommodation:       '🏠',
  tourist_attraction:  '🎭',
  tour_operator:       '🦁',
}

// Season badges
const SEASON_LABELS = {
  peak:     { label: 'Peak Season',  color: '#ef4444', bg: '#fef2f2' },
  low:      { label: 'Low Season',   color: '#3b82f6', bg: '#eff6ff' },
  all_year: { label: 'All Year',     color: '#10b981', bg: '#f0fdf4' },
}

// Visual star rating
function StarRating({ rating }) {
  if (!rating) return null
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span style={{ fontSize: '14px', letterSpacing: '1px' }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
        {rating}/5
      </span>
    </span>
  )
}

export default function RecommendationCard({ recommendation }) {
  const {
    rank,
    name,
    url,
    category,
    region,
    star_rating,
    price_per_night,
    reason,
    amenities,
    images,
    top_review,
    is_premium,
    packages,
  } = recommendation

  const [activeImage, setActiveImage] = useState(0)
  const sortedImages = [...(images || [])].sort((a, b) => b.is_primary - a.is_primary)
  const currentImage = sortedImages[activeImage]
  const categoryIcon = CATEGORY_ICONS[category] || '📍'

  return (
    <div style={{
      ...styles.card,
      border:     is_premium ? '2px solid #f97316' : '1px solid #e5e7eb',
      boxShadow:  is_premium ? '0 4px 24px rgba(249,115,22,0.18)' : '0 2px 12px rgba(0,0,0,0.08)',
    }}>

      {/* Rank badge */}
      <div style={styles.rankBadge}>#{rank}</div>

      {/* Featured badge */}
      {is_premium && (
        <div style={styles.featuredBadge}>⭐ Featured</div>
      )}

      {/* Images */}
      {sortedImages.length > 0 && (
        <div style={styles.imageContainer}>
          <img
            src={currentImage.url}
            alt={currentImage.caption || name}
            style={styles.image}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          {/* Gradient overlay */}
          <div style={styles.imageOverlay} />

          {/* Caption */}
          {currentImage.caption && (
            <div style={styles.caption}>{currentImage.caption}</div>
          )}

          {/* Thumbnail switcher */}
          {sortedImages.length > 1 && (
            <div style={styles.thumbnails}>
              {sortedImages.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={img.caption || `Image ${index + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: index === activeImage
                      ? '2px solid #f97316'
                      : '2px solid rgba(255,255,255,0.5)',
                    opacity: index === activeImage ? 1 : 0.7,
                  }}
                  onClick={() => setActiveImage(index)}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card body */}
      <div style={styles.body}>

        {/* Name + category */}
        <div style={styles.header}>
          <h3 style={styles.name}>{name}</h3>
          <span style={{
            ...styles.categoryBadge,
            background: is_premium ? '#fff7ed' : '#f3f4f6',
            color:      is_premium ? '#c2410c' : '#6b7280',
            border:     is_premium ? '1px solid #fed7aa' : '1px solid #e5e7eb',
          }}>
            {categoryIcon} {category.replace('_', ' ')}
          </span>
        </div>

        {/* Region + rating + price */}
        <div style={styles.meta}>
          <span style={styles.region}>📍 {region}</span>
          <span style={{ color: '#f59e0b' }}>
            <StarRating rating={star_rating} />
          </span>
          {price_per_night && (
            <span style={styles.price}>
              From KES {price_per_night.toLocaleString()}
            </span>
          )}
        </div>

        {/* Reason */}
        <p style={{
          ...styles.reason,
          borderLeft: is_premium ? '3px solid #f97316' : '3px solid #d1d5db',
          background: is_premium ? '#fff7ed' : '#f9fafb',
        }}>
          💡 {reason}
        </p>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div style={styles.amenities}>
            {amenities.map((amenity, index) => (
              <span key={index} style={styles.amenityBadge}>{amenity}</span>
            ))}
          </div>
        )}

        {/* Packages */}
        {packages && packages.length > 0 && (
          <div style={styles.packages}>
            <div style={styles.packagesTitle}>📦 Available Packages</div>
            {packages.slice(0, 3).map((pkg, index) => {
              const season = SEASON_LABELS[pkg.season] || SEASON_LABELS['all_year']
              return (
                <div key={index} style={{
                  ...styles.packageItem,
                  borderBottom: index < Math.min(packages.length, 3) - 1
                    ? '1px solid #f3f4f6'
                    : 'none',
                }}>
                  <div style={styles.packageHeader}>
                    <span style={styles.packageName}>{pkg.name}</span>
                    <span style={styles.packagePrice}>
                      KES {pkg.price.toLocaleString()}
                      <span style={styles.packagePriceType}>
                        /{pkg.price_type.replace('_', ' ')}
                      </span>
                    </span>
                  </div>
                  <div style={styles.packageMeta}>
                    {pkg.duration_days && (
                      <span style={styles.packageTag}>
                        ⏱ {pkg.duration_days} day{pkg.duration_days > 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{
                      ...styles.packageTag,
                      color:      season.color,
                      background: season.bg,
                    }}>
                      {season.label}
                    </span>
                    {pkg.min_guests > 1 && (
                      <span style={styles.packageTag}>
                        👥 Min {pkg.min_guests} guests
                      </span>
                    )}
                  </div>
                  {pkg.inclusions && (
                    <div style={styles.packageInclusions}>
                      ✓ {pkg.inclusions}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Top review */}
        {top_review && (
          <blockquote style={styles.review}>
            "{top_review}"
          </blockquote>
        )}

        {/* CTA Button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.link,
            background: is_premium ? '#f97316' : '#1f2937',
          }}
        >
          {is_premium ? '⭐ View Featured Listing →' : `${categoryIcon} View on Tembeago →`}
        </a>

      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  card: {
    position:     'relative',
    background:   '#ffffff',
    borderRadius: '16px',
    overflow:     'hidden',
    marginBottom: '20px',
  },
  rankBadge: {
    position:     'absolute',
    top:          '12px',
    left:         '12px',
    background:   '#f97316',
    color:        '#fff',
    fontWeight:   'bold',
    fontSize:     '13px',
    padding:      '4px 10px',
    borderRadius: '20px',
    zIndex:       2,
    boxShadow:    '0 2px 8px rgba(0,0,0,0.2)',
  },
  featuredBadge: {
    position:     'absolute',
    top:          '12px',
    right:        '12px',
    background:   'linear-gradient(135deg, #f97316, #ea580c)',
    color:        '#fff',
    fontWeight:   'bold',
    fontSize:     '12px',
    padding:      '4px 10px',
    borderRadius: '20px',
    zIndex:       2,
    boxShadow:    '0 2px 8px rgba(249,115,22,0.4)',
  },
  imageContainer: {
    position:   'relative',
    width:      '100%',
    height:     '220px',
    background: '#f3f4f6',
    overflow:   'hidden',
  },
  image: {
    width:      '100%',
    height:     '100%',
    objectFit:  'cover',
    transition: 'transform 0.3s ease',
  },
  imageOverlay: {
    position:   'absolute',
    bottom:     0,
    left:       0,
    right:      0,
    height:     '60px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
  },
  caption: {
    position:   'absolute',
    bottom:     '36px',
    left:       '12px',
    color:      '#fff',
    fontSize:   '12px',
    fontWeight: '500',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  },
  thumbnails: {
    position:  'absolute',
    bottom:    '8px',
    left:      '50%',
    transform: 'translateX(-50%)',
    display:   'flex',
    gap:       '4px',
  },
  thumbnail: {
    width:        '34px',
    height:       '34px',
    objectFit:    'cover',
    borderRadius: '6px',
    cursor:       'pointer',
    transition:   'all 0.2s',
  },
  body: {
    padding: '16px',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   '8px',
    gap:            '8px',
  },
  name: {
    fontSize:   '18px',
    fontWeight: '700',
    color:      '#111827',
    margin:     0,
    flex:       1,
  },
  categoryBadge: {
    fontSize:     '12px',
    padding:      '3px 8px',
    borderRadius: '20px',
    whiteSpace:   'nowrap',
    fontWeight:   '500',
  },
  meta: {
    display:      'flex',
    gap:          '10px',
    flexWrap:     'wrap',
    marginBottom: '10px',
    fontSize:     '14px',
    color:        '#6b7280',
    alignItems:   'center',
  },
  region: {
    color: '#6b7280',
  },
  price: {
    color:      '#059669',
    fontWeight: '700',
    fontSize:   '15px',
  },
  reason: {
    fontSize:     '14px',
    color:        '#374151',
    padding:      '8px 12px',
    borderRadius: '0 8px 8px 0',
    margin:       '10px 0',
    lineHeight:   '1.5',
  },
  amenities: {
    display:      'flex',
    flexWrap:     'wrap',
    gap:          '5px',
    margin:       '10px 0',
  },
  amenityBadge: {
    fontSize:     '11px',
    background:   '#eff6ff',
    color:        '#1d4ed8',
    padding:      '3px 8px',
    borderRadius: '20px',
    border:       '1px solid #bfdbfe',
  },
  packages: {
    margin:       '12px 0',
    border:       '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow:     'hidden',
  },
  packagesTitle: {
    fontSize:     '12px',
    fontWeight:   '700',
    color:        '#374151',
    background:   '#f9fafb',
    padding:      '8px 12px',
    borderBottom: '1px solid #e5e7eb',
    letterSpacing:'0.3px',
  },
  packageItem: {
    padding: '10px 12px',
  },
  packageHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '4px',
  },
  packageName: {
    fontSize:   '13px',
    fontWeight: '600',
    color:      '#111827',
  },
  packagePrice: {
    fontSize:   '13px',
    fontWeight: '700',
    color:      '#059669',
  },
  packagePriceType: {
    fontSize:   '11px',
    fontWeight: '400',
    color:      '#6b7280',
  },
  packageMeta: {
    display:   'flex',
    gap:       '6px',
    flexWrap:  'wrap',
    margin:    '4px 0',
  },
  packageTag: {
    fontSize:     '11px',
    padding:      '2px 7px',
    borderRadius: '20px',
    background:   '#f3f4f6',
    color:        '#374151',
    border:       '1px solid #e5e7eb',
  },
  packageInclusions: {
    fontSize:  '11px',
    color:     '#6b7280',
    marginTop: '3px',
  },
  review: {
    fontSize:    '13px',
    color:       '#6b7280',
    fontStyle:   'italic',
    borderLeft:  '3px solid #e5e7eb',
    paddingLeft: '10px',
    margin:      '12px 0',
    lineHeight:  '1.5',
  },
  link: {
    display:       'inline-block',
    marginTop:     '12px',
    color:         '#fff',
    padding:       '10px 20px',
    borderRadius:  '10px',
    textDecoration:'none',
    fontSize:      '14px',
    fontWeight:    '600',
    letterSpacing: '0.3px',
    transition:    'opacity 0.2s',
  },
}
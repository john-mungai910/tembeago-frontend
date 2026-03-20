/**
 * RecommendationCard.jsx
 * ----------------------
 * Displays a single vendor recommendation card with
 * photo, rating, amenities, reason and Tembeago link.
 *
 * Props:
 *   recommendation - a single recommendation object from the agent response
 */

import { useState } from 'react'

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
  } = recommendation

  // Track which image is currently shown
  const [activeImage, setActiveImage] = useState(0)

  // Get primary image first, then the rest
  const sortedImages = [...(images || [])].sort((a, b) => b.is_primary - a.is_primary)
  const currentImage = sortedImages[activeImage]

  return (
    <div style={styles.card}>

      {/* Rank badge */}
      <div style={styles.rankBadge}>#{rank}</div>

      {/* Images */}
      {sortedImages.length > 0 && (
        <div style={styles.imageContainer}>
          <img
            src={currentImage.url}
            alt={currentImage.caption || name}
            style={styles.image}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          {/* Image caption */}
          {currentImage.caption && (
            <div style={styles.caption}>{currentImage.caption}</div>
          )}
          {/* Image thumbnails if more than one */}
          {sortedImages.length > 1 && (
            <div style={styles.thumbnails}>
              {sortedImages.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={img.caption || `Image ${index + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: index === activeImage ? '2px solid #f97316' : '2px solid transparent',
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
          <span style={styles.category}>{category.replace('_', ' ')}</span>
        </div>

        {/* Region + rating + price */}
        <div style={styles.meta}>
          <span style={styles.region}>📍 {region}</span>
          {star_rating && (
            <span style={styles.rating}>⭐ {star_rating}/5</span>
          )}
          {price_per_night && (
            <span style={styles.price}>KES {price_per_night.toLocaleString()}/night</span>
          )}
        </div>

        {/* Why we recommend this */}
        <p style={styles.reason}>💡 {reason}</p>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div style={styles.amenities}>
            {amenities.map((amenity, index) => (
              <span key={index} style={styles.amenityBadge}>{amenity}</span>
            ))}
          </div>
        )}

        {/* Top review */}
        {top_review && (
          <blockquote style={styles.review}>
            "{top_review}"
          </blockquote>
        )}

        {/* Tembeago link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          View on Tembeago →
        </a>

      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  card: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
  },
  rankBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: '#f97316',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '4px 10px',
    borderRadius: '20px',
    zIndex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '220px',
    background: '#f3f4f6',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  caption: {
    position: 'absolute',
    bottom: '40px',
    left: 0,
    right: 0,
    background: 'rgba(0,0,0,0.4)',
    color: '#fff',
    fontSize: '12px',
    padding: '4px 8px',
    textAlign: 'center',
  },
  thumbnails: {
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '4px',
  },
  thumbnail: {
    width: '36px',
    height: '36px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  body: {
    padding: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  category: {
    fontSize: '12px',
    background: '#f3f4f6',
    color: '#6b7280',
    padding: '3px 8px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  meta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#6b7280',
  },
  region: {},
  rating: { color: '#f59e0b', fontWeight: '600' },
  price: { color: '#10b981', fontWeight: '600' },
  reason: {
    fontSize: '14px',
    color: '#374151',
    background: '#fef9f0',
    borderLeft: '3px solid #f97316',
    padding: '8px 12px',
    borderRadius: '0 8px 8px 0',
    margin: '10px 0',
  },
  amenities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    margin: '10px 0',
  },
  amenityBadge: {
    fontSize: '12px',
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  review: {
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    borderLeft: '3px solid #e5e7eb',
    paddingLeft: '10px',
    margin: '10px 0',
  },
  link: {
    display: 'inline-block',
    marginTop: '10px',
    background: '#f97316',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
}

import { GOOGLE_MAPS_URL, VENUE_COORDINATES } from "../data/wedding";

export function VenueSection() {
  const embedUrl = `https://maps.google.com/maps?q=${VENUE_COORDINATES}&z=17&t=k&output=embed`;

  return (
    <section className="venue section" id="venue">
      <div className="section-heading venue-heading">
        <p className="eyebrow">Getting there</p>
        <h2>Gallatin River Hideaway</h2>
        <p className="lead narrow">
          We will be celebrating at the Creekside venue, tucked among the cottonwoods along the water just outside Bozeman.
        </p>
      </div>

      <div className="venue-layout">
        <div className="venue-map-shell">
          <iframe
            className="venue-map"
            title="Satellite map to Gallatin River Hideaway Creekside"
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <aside className="venue-card">
          <p className="eyebrow">Creekside venue</p>
          <h3>135 Hideaway Drive</h3>
          <p>Bozeman, Montana 59718</p>
          <div className="venue-divider" />
          <p className="venue-note">
            Use the map for the venue entrance. Parking is immediately inside the entrance.
          </p>
          <a className="primary-button venue-directions" href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer">
            Open in Google Maps →
          </a>
        </aside>
      </div>
    </section>
  );
}

import { useState } from "react";
import { RsvpSection } from "./components/RsvpSection";
import { AMAZON_REGISTRY_URL as AMAZON_REGISTRY, WEDDING_DATE, galleryPhotos, scheduleDays } from "./data/wedding";

const VENMO_URL = "https://venmo.com/junzaga22";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const daysAway = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));

  return (
    <main>
      <nav className="nav">
        <a className="monogram" href="#home" onClick={closeMenu}>J + A</a>
        <button
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#story" onClick={closeMenu}>Our Story</a>
          <a href="#details" onClick={closeMenu}>Details</a>
          <a href="#gallery" onClick={closeMenu}>Gallery</a>
          <a href="#registry" onClick={closeMenu}>Registry</a>
          <a href="#honeymoon" onClick={closeMenu}>Honeymoon</a>
          <a className="nav-rsvp" href="#rsvp" onClick={closeMenu}>RSVP</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">We’re getting married</p>
          <h1>Jordan <span>&</span> Alexandra</h1>
          <div className="three-stone" aria-hidden="true">
            <span className="pear pear-left" />
            <span className="oval-stone" />
            <span className="pear pear-right" />
          </div>
          <p className="hero-date">June 5, 2027 · Gallatin River Hideaway, Creekside</p>
          <p className="countdown">{daysAway} days to go</p>
          <a className="primary-button" href="#rsvp">RSVP</a>
        </div>
      </section>

      <section className="intro section">
        <p className="eyebrow">Save the date</p>
        <h2>We cannot wait to celebrate with you.</h2>
        <p className="lead">
          Welcome to our wedding website. Find the schedule, travel information,
          registry, honeymoon fund, and everything else you need for the weekend.
        </p>
      </section>

      <section className="story section" id="story">
        <div className="story-image" role="img" aria-label="Jordan and Alexandra together outdoors" />
        <div className="story-copy">
          <p className="eyebrow">Our story</p>
          <h2>From our first hello to forever.</h2>
          <p>
            We met after moving to Bozeman, and what started with an invitation
            to church grew into friendship, a mutual crush, plenty of adventures,
            and eventually the easiest yes of our lives.
          </p>
          <p>
            We are so excited to celebrate this next chapter with the people we love most.
          </p>
        </div>
      </section>

      <section className="details section" id="details">
        <div className="section-heading">
          <p className="eyebrow">The celebration</p>
          <h2>Wedding details</h2>
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <span className="detail-number">01</span>
            <h3>Ceremony & Reception</h3>
            <p>Saturday, June 5, 2027</p>
            <p>
              Gallatin River Hideaway<br />
              Creekside location<br />
              Bozeman, Montana
            </p>
          </article>

          <article className="detail-card">
            <span className="detail-number">02</span>
            <h3>Dress Code</h3>
            <p>Semi-formal</p>
            <p>
              Cocktail dresses, jumpsuits, suits, button-down shirts,
              and comfortable dancing shoes are all welcome.
            </p>
          </article>

          <article className="detail-card">
            <span className="detail-number">03</span>
            <h3>Travel</h3>
            <p>Lodging information coming soon.</p>
            <p>
              We will add accommodation ideas, directions, parking details,
              and other helpful recommendations as plans are finalized.
            </p>
          </article>
        </div>
      </section>

      <section className="schedule section">
        <div className="section-heading">
          <p className="eyebrow">The weekend</p>
          <h2>Three-day schedule</h2>
          <p className="lead narrow">
            A weekend built around one beautiful day, with room to gather before and after.
          </p>
        </div>

        <div className="weekend-schedule">
          {scheduleDays.map((day) => (
            <article className="schedule-day" key={day.day}>
              <div className="schedule-day-top">
                <div>
                  <span>{day.day}</span>
                  <p className="schedule-date">{day.date}</p>
                </div>
              </div>

              <div className="day-events">
                {day.events.map((event, index) => (
                  <div className="schedule-event" key={`${day.day}-${index}`}>
                    <time>{event.time}</time>
                    <div>
                      <h3>{event.title}</h3>
                      {event.detail && <p>{event.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section" id="gallery">
        <div className="section-heading">
          <p className="eyebrow">A little glimpse of us</p>
          <h2>Our engagement</h2>
          <p className="lead narrow">
            A few favorite moments from the mountains, the lake, and the beginning of forever.
          </p>
        </div>

        <div className="photo-grid">
          {galleryPhotos.map((photo, index) => (
            <figure className={`photo-tile photo-${index + 1}`} key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      <section className="registry section" id="registry">
        <div className="section-heading">
          <p className="eyebrow">With love</p>
          <h2>Registry</h2>
          <p className="lead narrow">
            Your presence is the greatest gift. For anyone who would like to help
            us begin married life, our registry is available below.
          </p>
        </div>

        <a
          className="secondary-button registry-button"
          href={AMAZON_REGISTRY}
          target="_blank"
          rel="noreferrer"
        >
          View our Amazon registry
        </a>
      </section>

      <section className="honeymoon section" id="honeymoon">
        <div className="honeymoon-card">
          <p className="eyebrow">Our first adventure</p>
          <h2>Honeymoon Fund</h2>
          <p className="honeymoon-copy">
            Your presence at our wedding is more than enough. If you would like
            to help us celebrate our first adventure as newlyweds, we would be
            incredibly grateful for a contribution toward our honeymoon.
          </p>

          <div className="honeymoon-actions">
            <a
              className="honeymoon-button"
              href={VENMO_URL}
              target="_blank"
              rel="noreferrer"
            >
              Contribute with Venmo ♡
            </a>
            <p className="honeymoon-username">
              Venmo <strong>@junzaga22</strong>
            </p>
          </div>

          <p className="honeymoon-note">
            Gifts are never expected — celebrating with you is what matters most.
          </p>
        </div>
      </section>

      <RsvpSection />

      <section className="faq section">
        <div className="section-heading">
          <p className="eyebrow">Good to know</p>
          <h2>Frequently asked questions</h2>
        </div>

        <div className="faq-grid">
          <details>
            <summary>Can I bring a plus-one?</summary>
            <p>Your invitation will show everyone included in your reserved seats.</p>
          </details>
          <details>
            <summary>Are children invited?</summary>
            <p>Please use the guest names shown on your invitation.</p>
          </details>
          <details>
            <summary>Is there parking?</summary>
            <p>Parking and arrival details will be added as plans are finalized.</p>
          </details>
          <details>
            <summary>When should I arrive?</summary>
            <p>We recommend arriving 20–30 minutes before the ceremony.</p>
          </details>
        </div>
      </section>

      <footer>
        <p className="footer-names">Jordan & Alexandra</p>
        <p>June 5, 2027 · Gallatin River Hideaway, Creekside</p>
        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}

export default App;

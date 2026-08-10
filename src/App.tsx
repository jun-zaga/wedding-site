import { FormEvent, useMemo, useState } from "react";

type RegistryItem = {
  id: string;
  name: string;
  category: string;
  note: string;
  image: string;
  link: string;
  price: number;
  quantityWanted: number;
  quantityPurchased: number;
  contributed: number;
  groupGift: boolean;
};

type ScheduleEvent = {
  time: string;
  title: string;
  detail?: string;
};

type ScheduleDay = {
  day: string;
  date: string;
  events: ScheduleEvent[];
};

const registryItems: RegistryItem[] = [
  {
    id: "stand-mixer",
    name: "Stand Mixer",
    category: "Kitchen",
    note: "For Sunday baking and way too many cookies.",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=900&q=80",
    link: "https://www.amazon.com/wedding",
    price: 449.99,
    quantityWanted: 1,
    quantityPurchased: 0,
    contributed: 175,
    groupGift: true
  },
  {
    id: "sheet-set",
    name: "Cozy Sheet Set",
    category: "Home",
    note: "A fresh start for our first home together.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    link: "https://www.amazon.com/wedding",
    price: 129.99,
    quantityWanted: 1,
    quantityPurchased: 0,
    contributed: 0,
    groupGift: false
  },
  {
    id: "weekend-luggage",
    name: "Weekend Luggage",
    category: "Travel",
    note: "For the honeymoon and every trip after.",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=900&q=80",
    link: "https://www.amazon.com/wedding",
    price: 189.99,
    quantityWanted: 1,
    quantityPurchased: 0,
    contributed: 70,
    groupGift: true
  },
  {
    id: "dutch-oven",
    name: "Dutch Oven",
    category: "Kitchen",
    note: "For soups, bread, and cold Montana evenings.",
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80",
    link: "https://www.amazon.com/wedding",
    price: 219.99,
    quantityWanted: 1,
    quantityPurchased: 0,
    contributed: 0,
    groupGift: false
  },
  {
    id: "coffee-maker",
    name: "Coffee Maker",
    category: "Kitchen",
    note: "A very important investment in our mornings together.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    link: "https://www.amazon.com/wedding",
    price: 159.99,
    quantityWanted: 1,
    quantityPurchased: 1,
    contributed: 0,
    groupGift: false
  }
];

const scheduleDays: ScheduleDay[] = [
  {
    day: "Day One",
    date: "Friday · June 4, 2027",
    events: [
      {
        time: "12:00 PM",
        title: "Venue Opens",
        detail: "Come by, get settled, and hang out."
      },
      {
        time: "4:00 PM",
        title: "Venue Closes",
        detail: "Please return for the ceremony and reception tomorrow."
      },

    ]
  },

  {
    day: "Day Two",
    date: "Saturday · June 5, 2027",
    events: [
      {
        time: "8:00 AM",
        title: "Getting Ready"
      },
      {
        time: "2:30 PM",
        title: "Guests Arrive"
      },
      {
        time: "3:00 PM",
        title: "Ceremony"
      },
      {
        time: "3:30 PM",
        title: "Cocktail Hour"
      },
      {
        time: "5:00 PM",
        title: "Dinner"
      },
      {
        time: "6:00 PM",
        title: "Toasts & Speeches"
      },
      {
        time: "7:00 PM",
        title: "First Dance"
      },
      {
        time: "7:30 PM",
        title: "Open Dancing"
      },
      {
        time: "11:30 PM",
        title: "Last Dance"
      },
      {
        time: "12:00 AM",
        title: "Goodnight"
      }
    ]
  },

  {
    day: "Day Three",
    date: "Sunday · June 6, 2027 · Alex and Jordan Absent",
    events: [
      {
        time: "8:00 AM",
        title: "Cleanup"
      },
      {
        time: "11:00 AM",
        title: "Farewells"
      },
      {
        time: "12:00 PM",
        title: "Venue Close"
      }
    ]
  }
];

const galleryPhotos = [
  { src: "/photos/bridge-kiss.jpg", alt: "Alexandra and Jordan kissing on a wooden bridge" },
  { src: "/photos/champagne-pour.jpg", alt: "Alexandra pouring champagne beside the lake" },
  { src: "/photos/champagne-toast.jpg", alt: "Champagne glasses raised in front of the mountains" },
  { src: "/photos/bridge-embrace.jpg", alt: "Alexandra and Jordan embracing on a mountain bridge" },
  { src: "/photos/proposal.jpg", alt: "Proposal beside a mountain lake" },
  { src: "/photos/lakeside-lift.jpg", alt: "Jordan lifting Alexandra beside the lake" },
  { src: "/photos/lakeside-dip.jpg", alt: "A romantic dip beside the lake" },
  { src: "/photos/ring-hands.jpg", alt: "Alexandra's engagement ring with the lake in the background" },
  { src: "/photos/lakeside-spin.jpg", alt: "Alexandra and Jordan spinning together by the lake" },
  { src: "/photos/lake-embrace.jpg", alt: "Alexandra and Jordan embracing with the mountain lake behind them" }
];

type GuestMember = {
  guestId: string;
  displayName: string;
  rsvpStatus: string;
};

type HouseholdResult = {
  household: string;
  primaryGuestId: string;
  reservedSeats: number;
  members: GuestMember[];
  address: {
    street: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
  };
};

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwpi6FwXM41decufY7kqJUxQttYz_q19tyWq24OYiYOywHTIJphOgXBVY5lBiQlyMLn/exec";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HouseholdResult[]>([]);
  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdResult | null>(null);

  const [attendingGuestIds, setAttendingGuestIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [street, setStreet] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const weddingDate = useMemo(
    () => new Date("2027-06-05T16:00:00"),
    []
  );

  const daysAway = Math.max(
    0,
    Math.ceil(
      (weddingDate.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const searchGuests = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmed = searchName.trim();

    if (!trimmed) return;

    setSearching(true);
    setSearchResults([]);
    setSelectedHousehold(null);

    try {
      const url =
        `${GOOGLE_SCRIPT_URL}?action=search&name=` +
        encodeURIComponent(trimmed);

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Guest search failed.");
        return;
      }

      setSearchResults(result.results || []);
    } catch (error) {
      console.error("Guest search failed:", error);
      alert("We could not search the guest list. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const chooseHousehold = (household: HouseholdResult) => {
    setSelectedHousehold(household);

    setAttendingGuestIds(
      household.members
        .filter((member) => member.rsvpStatus === "Accepted")
        .map((member) => member.guestId)
    );

    setStreet(household.address?.street || "");
    setLine2(household.address?.line2 || "");
    setCity(household.address?.city || "");
    setState(household.address?.state || "");
    setZip(household.address?.zip || "");

    setSearchResults([]);
  };

  const toggleGuest = (guestId: string) => {
    setAttendingGuestIds((current) =>
      current.includes(guestId)
        ? current.filter((id) => id !== guestId)
        : [...current, guestId]
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedHousehold) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      household: selectedHousehold.household,
      primaryGuestId: selectedHousehold.primaryGuestId,
      attendingGuestIds,
      dietary: formData.get("dietary"),
      song: formData.get("song"),
      message: formData.get("message"),

      address: {
        street,
        line2,
        city,
        state,
        zip
      }
    };

    setSubmitting(true);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "RSVP submission failed."
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error("RSVP submission failed:", error);
      alert(
        "Something went wrong while submitting your RSVP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetRsvp = () => {
    setSubmitted(false);
    setSearchName("");
    setSearchResults([]);
    setSelectedHousehold(null);
    setAttendingGuestIds([]);
    setStreet("");
    setLine2("");
    setCity("");
    setState("");
    setZip("");
  };

  const isRegistryItemComplete = (item: RegistryItem) => {
    const quantityComplete =
      item.quantityWanted > 0 &&
      item.quantityPurchased >= item.quantityWanted;

    const contributionComplete =
      item.groupGift &&
      item.price > 0 &&
      item.contributed >= item.price;

    return quantityComplete || contributionComplete;
  };

  const featuredRegistryItems = registryItems
    .filter((item) => !isRegistryItemComplete(item))
    .slice(0, 3);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);

  const contributionPercent = (item: RegistryItem) => {
    if (!item.groupGift || item.price <= 0) return 0;

    return Math.min(
      100,
      Math.round((item.contributed / item.price) * 100)
    );
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <nav className="nav">
        <a className="monogram" href="#home" onClick={closeMenu}>A + J</a>
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
          <a className="nav-rsvp" href="#rsvp" onClick={closeMenu}>RSVP</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">We’re getting married!</p>
          <h1>Alexandra <span>&</span> Jordan</h1>
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
          registry, and everything else you need for the weekend.
        </p>
      </section>

      <section className="story section" id="story">
        <div className="story-image" role="img" aria-label="Alexandra and Jordan together outdoors" />
        <div className="story-copy">
          <p className="eyebrow">Our story</p>
          <h2>From our first hello to forever.</h2>
          <p>
            Add your story here—how you met, your favorite adventures, and the
            moment you knew you wanted to spend your lives together.
          </p>
          <p>
            This section can be playful, sentimental, short, or eventually turned
            into a photo timeline.
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
              Additional venue details coming soon.
            </p>
            <a href="#" onClick={(e) => e.preventDefault()}>View map →</a>
          </article>
          <article className="detail-card">
            <span className="detail-number">02</span>
            <h3>Dress Code</h3>
            <p>Semi-formal</p>
            <p>
              Think cocktail dresses, jumpsuits, suits, button-down shirts, and
              comfortable dancing shoes.
            </p>
          </article>
          <article className="detail-card">
            <span className="detail-number">03</span>
            <h3>Travel</h3>
            <p>Lodging information coming soon.</p>
            <p>
              We will add accommodation ideas, directions, parking details, and
              other helpful recommendations once everything is finalized.
            </p>
          </article>
        </div>
      </section>

      <section className="schedule section">
        <div className="section-heading">
          <p className="eyebrow">The weekend</p>
          <h2>Three-day schedule</h2>
          <p className="lead narrow">
            A weekend built around one beautiful day, with a little room to gather before and after.
          </p>
        </div>

        <div className="schedule-flourish" aria-hidden="true">
          <span className="ring-band band-left" />
          <span className="schedule-pear schedule-pear-left" />
          <span className="schedule-oval" />
          <span className="schedule-pear schedule-pear-right" />
          <span className="ring-band band-right" />
        </div>

        <div className="schedule-shell">
  <div className="weekend-schedule">
    {scheduleDays.map((item) => (
      <article className="schedule-day" key={item.day}>
        <div className="schedule-day-top">
          <div>
            <span>{item.day}</span>
            <p className="schedule-date">{item.date}</p>
          </div>
        </div>

          <div className="day-events">
            {item.events.map((event, index) => (
              <div className="schedule-event" key={`${item.day}-${index}`}>
                <time>{event.time}</time>

                <div>
                  <h3>{event.title}</h3>

                  {event.detail && (
                    <p>{event.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  </div>

<div className="jordan-ring-flourish" aria-hidden="true">
  <span className="jordan-ring-line">
    <span className="jordan-gold-line jordan-gold-top" />
    <span className="jordan-black-line" />
    <span className="jordan-gold-line jordan-gold-bottom" />
  </span>
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
            Your presence is the greatest gift. For anyone who would like to
            help us begin married life, here are a few things we are still
            looking forward to.
          </p>
        </div>

        <div className="registry-grid">
          {featuredRegistryItems.map((item) => {
            const percent = contributionPercent(item);

            return (
              <article className="registry-card" key={item.id}>
                <div className="registry-image-wrap">
                  <img src={item.image} alt={item.name} />

                  {item.groupGift && item.contributed > 0 && (
                    <span className="registry-progress-badge">
                      {percent}% funded
                    </span>
                  )}
                </div>

                <div className="registry-card-body">
                  <span className="registry-category">{item.category}</span>

                  <h3>{item.name}</h3>

                  <p className="registry-note">{item.note}</p>

                  <p className="registry-price">
                    {formatMoney(item.price)}
                  </p>

                  {item.groupGift ? (
                    <div className="registry-contribution">
                      <div className="registry-contribution-top">
                        <span>
                          {formatMoney(item.contributed)} contributed
                        </span>

                        <span>
                          of {formatMoney(item.price)}
                        </span>
                      </div>

                      <div
                        className="registry-progress"
                        aria-label={`${percent}% funded`}
                      >
                        <div
                          className="registry-progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="registry-quantity">
                      {Math.max(
                        0,
                        item.quantityWanted - item.quantityPurchased
                      )}{" "}
                      still needed
                    </p>
                  )}

                  <a
                    className="registry-item-link"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.groupGift
                      ? "View or contribute →"
                      : "View on Amazon →"}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {featuredRegistryItems.length === 0 && (
          <div className="registry-complete">
            <h3>We are incredibly grateful.</h3>
            <p>
              Everything currently featured on our registry has been purchased
              or fully contributed toward.
            </p>
          </div>
        )}

        <a
          className="secondary-button"
          href="https://www.amazon.com/wedding"
          target="_blank"
          rel="noreferrer"
        >
          View full Amazon registry
        </a>
      </section>

<section className="rsvp section" id="rsvp">
  <div className="rsvp-copy">
    <p className="eyebrow">Kindly reply</p>

    <h2>Will you be joining us?</h2>

    <p>Please respond by May 1, 2027.</p>

    <p className="small-note">
      Search for your name below to find your invitation.
      You will be able to RSVP for everyone included in your household.
    </p>
  </div>

  {submitted ? (
    <div className="confirmation">
      <span>✓</span>

      <h3>Thank you!</h3>

      <p>
        Your RSVP has been received. We cannot wait to celebrate
        with you!
      </p>

      <button onClick={resetRsvp}>
        Submit another RSVP
      </button>
    </div>
  ) : !selectedHousehold ? (
    <div className="rsvp-lookup">
      <form
        className="rsvp-form"
        onSubmit={searchGuests}
      >
        <label>
          Find your invitation

          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </label>

        <button
          className="primary-button form-button"
          type="submit"
          disabled={searching}
        >
          {searching
            ? "Searching..."
            : "Find My Invitation"}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          <p className="search-results-heading">
            We found:
          </p>

          {/* Replace ONLY the searchResults.map(...) button contents with this */}

{searchResults.map((result) => (
  <button
    type="button"
    className="household-result"
    key={result.primaryGuestId + result.household}
    onClick={() => chooseHousehold(result)}
  >
    <strong>{result.household}</strong>

    <span className="invitation-count">
      {result.members.length === 1
        ? "Individual invitation"
        : `${result.members.length} invited guests`}
    </span>

    {result.members.length > 1 && (
      <span className="invitation-members">
        {result.members
          .map((member) => member.displayName)
          .join(" · ")}
      </span>
    )}
  </button>
))}

        </div>
      )}

      {!searching &&
        searchName &&
        searchResults.length === 0 && (
          <p className="small-note">
            If you do not see your invitation, try
            searching using just your first or last
            name.
          </p>
        )}
    </div>
  ) : (
    <form
      className="rsvp-form household-rsvp"
      onSubmit={handleSubmit}
    >
      <div className="selected-household">
        <p className="eyebrow">
          Your invitation
        </p>

        <h3>
          {selectedHousehold.household}
        </h3>

        <button
          type="button"
          className="change-invitation"
          onClick={() => {
            setSelectedHousehold(null);
            setAttendingGuestIds([]);
          }}
        >
          Not your invitation? Search again
        </button>
      </div>

      <fieldset className="guest-selection">
        <legend>
          Who will be attending?
        </legend>

        <p className="small-note">
          Please check each person who will be
          joining us.
        </p>

        {selectedHousehold.members.map(
          (member) => (
            <label
              className="guest-checkbox"
              key={member.guestId}
            >
              <input
                type="checkbox"
                checked={attendingGuestIds.includes(
                  member.guestId
                )}
                onChange={() =>
                  toggleGuest(
                    member.guestId
                  )
                }
              />

              <span>
                {member.displayName}
              </span>
            </label>
          )
        )}
      </fieldset>

      {attendingGuestIds.length === 0 && (
        <div className="decline-note">
          <strong>
            Unable to attend?
          </strong>

          <p>
            Leave everyone unchecked and submit
            the form. We will record your
            household as regretfully declining.
          </p>
        </div>
      )}

      <div className="address-section">
        <div className="address-heading">
          <p className="eyebrow">
            Mailing address
          </p>

          <h3>
            Where should we send wedding mail?
          </h3>

          <p className="small-note">
            Please confirm the best address for
            invitations and thank-you cards.
          </p>
        </div>

        <label>
          Street address

          <input
            value={street}
            onChange={(e) =>
              setStreet(e.target.value)
            }
            required
            autoComplete="street-address"
            placeholder="123 Main Street"
          />
        </label>

        <label>
          Apartment, unit, etc.

          <input
            value={line2}
            onChange={(e) =>
              setLine2(e.target.value)
            }
            autoComplete="address-line2"
            placeholder="Optional"
          />
        </label>

        <div className="address-grid">
          <label>
            City

            <input
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              required
              autoComplete="address-level2"
            />
          </label>

          <label>
            State

            <input
              value={state}
              onChange={(e) =>
                setState(
                  e.target.value
                    .toUpperCase()
                    .slice(0, 2)
                )
              }
              required
              maxLength={2}
              placeholder="MT"
              autoComplete="address-level1"
            />
          </label>

          <label>
            ZIP

            <input
              value={zip}
              onChange={(e) =>
                setZip(e.target.value)
              }
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="59715"
            />
          </label>
        </div>
      </div>

      <label>
        Dietary restrictions

        <textarea
          name="dietary"
          placeholder="Allergies or dietary needs for anyone attending"
          rows={3}
        />
      </label>

      <label>
        Song request

        <input
          name="song"
          placeholder="What gets you on the dance floor?"
        />
      </label>

      <label>
        Anything else we should know?

        <textarea
          name="message"
          placeholder="Optional"
          rows={3}
        />
      </label>

      <div className="rsvp-summary">
        <strong>
          {attendingGuestIds.length === 0
            ? "Regretfully declining"
            : `${attendingGuestIds.length} ${
                attendingGuestIds.length === 1
                  ? "guest"
                  : "guests"
              } attending`}
        </strong>
      </div>

      <button
        className="primary-button form-button"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Sending RSVP..."
          : "Send RSVP"}
      </button>
    </form>
  )}
</section>

      <section className="faq section">
        <div className="section-heading">
          <p className="eyebrow">Good to know</p>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq-grid">
          <details>
            <summary>Can I bring a plus-one?</summary>
            <p>Your invitation will specify whether a plus-one has been reserved.</p>
          </details>
          <details>
            <summary>Are children invited?</summary>
            <p>Add your preferred wording and policy here.</p>
          </details>
          <details>
            <summary>Is there parking?</summary>
            <p>Parking and arrival details for the venue will be added once plans are finalized.</p>
          </details>
          <details>
            <summary>When should I arrive?</summary>
            <p>We recommend arriving 20–30 minutes before the ceremony.</p>
          </details>
        </div>
      </section>

      <footer>
        <p className="footer-names">Alexandra & Jordan</p>
        <p>June 5, 2027 · Gallatin River Hideaway, Creekside</p>
        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}

export default App;
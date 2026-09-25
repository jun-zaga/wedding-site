import { FormEvent, useMemo, useState } from "react";
import { GOOGLE_SCRIPT_URL } from "../data/wedding";
import type { AdditionalGuest, HouseholdResult, MailingAddress } from "../types/rsvp";

const emptyAddress = (): MailingAddress => ({ street: "", line2: "", city: "", state: "", zip: "" });
const hasCompleteAddress = (address: MailingAddress) =>
  Boolean(address.street.trim() && address.city.trim() && address.state.trim() && address.zip.trim());

function CopyAddressButtons({ sources, onCopy }: {
  sources: { key: string; name: string; address: MailingAddress }[];
  onCopy: (address: MailingAddress) => void;
}) {
  if (!sources.length) return null;
  return <div className="copy-address-options">
    {sources.map(source => <button type="button" className="add-guest-button" key={source.key}
      onClick={() => onCopy({ ...source.address })}>Same address as {source.name}</button>)}
    <p className="small-note">Copies the address below. You can edit it for this guest.</p>
  </div>;
}

function AddressFields({
  address,
  onChange,
  prefix,
}: {
  address: MailingAddress;
  onChange: (address: MailingAddress) => void;
  prefix: string;
}) {
  const set = (field: keyof MailingAddress, value: string) =>
    onChange({ ...address, [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value });

  return (
    <div className="person-address-fields">
      <label>
        Street address
        <input
          value={address.street}
          onChange={e => set("street", e.target.value)}
          required
          autoComplete={`section-${prefix} street-address`}
          placeholder="123 Main Street"
        />
      </label>
      <label>
        Apartment, unit, etc.
        <input
          value={address.line2}
          onChange={e => set("line2", e.target.value)}
          autoComplete={`section-${prefix} address-line2`}
          placeholder="Optional"
        />
      </label>
      <div className="address-grid">
        <label>
          City
          <input value={address.city} onChange={e => set("city", e.target.value)} required autoComplete={`section-${prefix} address-level2`} />
        </label>
        <label>
          State
          <input
            value={address.state}
            onChange={e => set("state", e.target.value)}
            required
            maxLength={2}
            placeholder="MT"
            autoComplete={`section-${prefix} address-level1`}
          />
        </label>
        <label>
          ZIP
          <input
            value={address.zip}
            onChange={e => set("zip", e.target.value)}
            required
            inputMode="numeric"
            autoComplete={`section-${prefix} postal-code`}
            placeholder="59715"
          />
        </label>
      </div>
    </div>
  );
}

export function RsvpSection() {
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HouseholdResult[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdResult | null>(null);
  const [attendingGuestIds, setAttendingGuestIds] = useState<string[]>([]);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);
  const [sharedAddress, setSharedAddress] = useState<MailingAddress>(emptyAddress());
  const [individualAddresses, setIndividualAddresses] = useState<Record<string, MailingAddress>>({});
  const [additionalGuestAddresses, setAdditionalGuestAddresses] = useState<Record<number, MailingAddress>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openGuestSeats = useMemo(() => {
    if (!selectedHousehold) return 0;
    return Math.max(0, selectedHousehold.reservedSeats - selectedHousehold.members.length);
  }, [selectedHousehold]);

  const attendingCount = attendingGuestIds.length + additionalGuests.length;
  const useIndividualAddresses = selectedHousehold?.addressCollectionMode === "Individual" ||
    new Set(selectedHousehold?.members.map(member => (member.lastName || member.displayName.trim().split(/\s+/).slice(1).join(" ")).trim().toLowerCase()).filter(Boolean)).size > 1 ||
    additionalGuests.length > 0;

  const addressSources = [
    ...(selectedHousehold?.members || []).filter(member => attendingGuestIds.includes(member.guestId))
      .map(member => ({ key: `named-${member.guestId}`, name: member.displayName, address: individualAddresses[member.guestId] || emptyAddress() })),
    ...additionalGuests.map((guest, index) => ({ key: `extra-${index}`, name: guest.name.trim() || `Guest ${index + 1}`, address: additionalGuestAddresses[index] || emptyAddress() })),
  ].filter(source => hasCompleteAddress(source.address));

  const searchGuests = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchName.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchResults([]);
    setSelectedHousehold(null);

    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=search&name=${encodeURIComponent(trimmed)}`);
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
      household.members.filter(member => member.rsvpStatus === "Accepted").map(member => member.guestId),
    );
    setAdditionalGuests([]);
    setSharedAddress(household.address || emptyAddress());
    setIndividualAddresses(
      Object.fromEntries(household.members.map(member => [member.guestId, member.address || emptyAddress()])),
    );
    setAdditionalGuestAddresses({});
    setSearchResults([]);
  };

  const toggleGuest = (guestId: string) => {
    setAttendingGuestIds(current =>
      current.includes(guestId) ? current.filter(id => id !== guestId) : [...current, guestId],
    );
  };

  const addGuest = () => {
    if (additionalGuests.length >= openGuestSeats) return;
    setAdditionalGuests(current => [...current, { name: "" }]);
  };

  const updateAdditionalGuest = (index: number, name: string) => {
    setAdditionalGuests(current => current.map((guest, i) => (i === index ? { ...guest, name } : guest)));
  };

  const removeAdditionalGuest = (index: number) => {
    setAdditionalGuests(current => current.filter((_, i) => i !== index));
    setAdditionalGuestAddresses(current => {
      const next: Record<number, MailingAddress> = {};
      Object.entries(current).forEach(([key, value]) => {
        const oldIndex = Number(key);
        if (oldIndex < index) next[oldIndex] = value;
        if (oldIndex > index) next[oldIndex - 1] = value;
      });
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedHousehold || submitting) return;

    const cleanedAdditionalGuests = additionalGuests
      .map(guest => ({ name: guest.name.trim() }))
      .filter(guest => guest.name.length > 0);

    if (cleanedAdditionalGuests.length !== additionalGuests.length) {
      alert("Please enter a name for each added guest, or remove the empty guest slot.");
      return;
    }

    if (attendingCount > 0) {
      if (useIndividualAddresses) {
        const missingNamed = attendingGuestIds.some(id => !hasCompleteAddress(individualAddresses[id] || emptyAddress()));
        const missingAdded = cleanedAdditionalGuests.some((_, index) => !hasCompleteAddress(additionalGuestAddresses[index] || emptyAddress()));
        if (missingNamed || missingAdded) {
          alert("Please enter a complete mailing address for each person who is attending.");
          return;
        }
      } else if (!hasCompleteAddress(sharedAddress)) {
        alert("Please enter the mailing address for your invitation.");
        return;
      }
    }

    const formData = new FormData(event.currentTarget);
    const data = {
      household: selectedHousehold.household,
      primaryGuestId: selectedHousehold.primaryGuestId,
      reservedSeats: selectedHousehold.reservedSeats,
      attendingGuestIds,
      additionalGuests: cleanedAdditionalGuests,
      numberAttending: attendingCount,
      dietary: formData.get("dietary"),
      song: formData.get("song"),
      message: formData.get("message"),
      addressCollectionMode: useIndividualAddresses ? "Individual" : "Shared",
      address: useIndividualAddresses ? emptyAddress() : sharedAddress,
      individualAddresses: useIndividualAddresses
        ? attendingGuestIds.map(guestId => ({ guestId, address: individualAddresses[guestId] || emptyAddress() }))
        : [],
      additionalGuestAddresses: useIndividualAddresses
        ? cleanedAdditionalGuests.map((guest, index) => ({ name: guest.name, address: additionalGuestAddresses[index] || emptyAddress() }))
        : [],
    };

    setSubmitting(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "RSVP submission failed.");
      setSubmitted(true);
    } catch (error) {
      console.error("RSVP submission failed:", error);
      alert("Something went wrong while submitting your RSVP. Please try again.");
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
    setAdditionalGuests([]);
    setSharedAddress(emptyAddress());
    setIndividualAddresses({});
    setAdditionalGuestAddresses({});
  };

  return (
    <section className="rsvp section" id="rsvp">
      <div className="rsvp-copy">
        <p className="eyebrow">Kindly reply</p>
        <h2>Will you be joining us?</h2>
        <p>Please respond by May 1, 2027.</p>
        <p className="small-note">
          Search for your name below. Your invitation will show exactly how many seats have been reserved for your party.
        </p>
      </div>

      {submitted ? (
        <div className="confirmation">
          <span>✓</span>
          <h3>Thank you!</h3>
          <p>{attendingCount > 0 ? "Your RSVP has been received. We cannot wait to celebrate with you!" : "Your RSVP has been received. Thank you for letting us know—we will miss you!"}</p>
          <button onClick={resetRsvp}>Submit another RSVP</button>
        </div>
      ) : !selectedHousehold ? (
        <div className="rsvp-lookup">
          <form className="rsvp-form" onSubmit={searchGuests}>
            <label>
              Find your invitation
              <input value={searchName} onChange={e => setSearchName(e.target.value)} required placeholder="Enter your name" />
            </label>
            <button className="primary-button form-button" type="submit" disabled={searching}>
              {searching ? "Searching..." : "Find My Invitation"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="search-results">
              <p className="search-results-heading">We found:</p>
              {searchResults.map(result => (
                <button
                  type="button"
                  className="household-result"
                  key={result.primaryGuestId + result.household}
                  onClick={() => chooseHousehold(result)}
                >
                  <strong>{result.household}</strong>
                  <span className="invitation-count">
                    {result.reservedSeats} {result.reservedSeats === 1 ? "seat" : "seats"} reserved
                  </span>
                  {result.members.length > 1 && (
                    <span className="invitation-members">{result.members.map(member => member.displayName).join(" · ")}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!searching && searchName && searchResults.length === 0 && (
            <p className="small-note">If you do not see your invitation, try searching using just your first or last name.</p>
          )}
        </div>
      ) : (
        <form className="rsvp-form household-rsvp" onSubmit={handleSubmit}>
          <div className="selected-household">
            <p className="eyebrow">Your invitation</p>
            <h3>{selectedHousehold.household}</h3>
            <p className="seat-allowance">
              {selectedHousehold.reservedSeats} {selectedHousehold.reservedSeats === 1 ? "seat has" : "seats have"} been reserved for your party.
            </p>
            <button
              type="button"
              className="change-invitation"
              onClick={() => {
                setSelectedHousehold(null);
                setAttendingGuestIds([]);
                setAdditionalGuests([]);
              }}
            >
              Not your invitation? Search again
            </button>
          </div>

          <fieldset className="guest-selection">
            <legend>Who will be attending?</legend>
            <p className="small-note">Check each named guest who will be joining us.</p>
            {selectedHousehold.members.map(member => (
              <label className="guest-checkbox" key={member.guestId}>
                <input
                  type="checkbox"
                  checked={attendingGuestIds.includes(member.guestId)}
                  onChange={() => toggleGuest(member.guestId)}
                />
                <span>{member.displayName}</span>
              </label>
            ))}
          </fieldset>

          {openGuestSeats > 0 && (
            <div className="additional-guest-section">
              <div className="additional-guest-heading">
                <div>
                  <p className="eyebrow">Open seat{openGuestSeats === 1 ? "" : "s"}</p>
                  <h3>{openGuestSeats === 1 ? "Bringing a guest?" : "Bringing additional guests?"}</h3>
                  <p className="small-note">
                    Your invitation includes {openGuestSeats} unnamed {openGuestSeats === 1 ? "seat" : "seats"}. Add a name for anyone using one.
                  </p>
                </div>
                {additionalGuests.length < openGuestSeats && (
                  <button type="button" className="add-guest-button" onClick={addGuest}>
                    + Add Guest
                  </button>
                )}
              </div>

              {additionalGuests.map((guest, index) => (
                <div className="additional-guest-row" key={`additional-guest-${index}`}>
                  <label>
                    Guest {index + 1} name
                    <input
                      value={guest.name}
                      onChange={e => updateAdditionalGuest(index, e.target.value)}
                      placeholder="First and last name"
                      required
                    />
                  </label>
                  <button type="button" className="remove-guest-button" onClick={() => removeAdditionalGuest(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {attendingCount === 0 && (
            <div className="decline-note">
              <strong>Unable to attend?</strong>
              <p>Leave everyone unchecked, do not add a guest, and submit the form. We will record your party as regretfully declining.</p>
            </div>
          )}

          {attendingCount > 0 && (
            <div className="address-section">
              <div className="address-heading">
                <p className="eyebrow">Mailing address{useIndividualAddresses ? "es" : ""}</p>
                <h3>{useIndividualAddresses ? "Where should we send mail for each guest?" : "Where should we send wedding mail?"}</h3>
                <p className="small-note">
                  {useIndividualAddresses
                    ? "Please confirm a mailing address for each person attending, even when guests share an address."
                    : "Please confirm the best shared address for invitations and thank-you cards."}
                </p>
              </div>

              {useIndividualAddresses ? (
                <div className="individual-address-list">
                  {selectedHousehold.members
                    .filter(member => attendingGuestIds.includes(member.guestId))
                    .map(member => (
                      <div className="individual-address-card" key={`address-${member.guestId}`}>
                        <h4>{member.displayName}</h4>
                        <CopyAddressButtons sources={addressSources.filter(source => source.key !== `named-${member.guestId}`)}
                          onCopy={address => setIndividualAddresses(current => ({ ...current, [member.guestId]: address }))} />
                        <AddressFields
                          address={individualAddresses[member.guestId] || emptyAddress()}
                          onChange={address => setIndividualAddresses(current => ({ ...current, [member.guestId]: address }))}
                          prefix={member.guestId}
                        />
                      </div>
                    ))}

                  {additionalGuests.map((guest, index) => (
                    <div className="individual-address-card" key={`extra-address-${index}`}>
                      <h4>{guest.name.trim() || `Guest ${index + 1}`}</h4>
                      <CopyAddressButtons sources={addressSources.filter(source => source.key !== `extra-${index}`)}
                        onCopy={address => setAdditionalGuestAddresses(current => ({ ...current, [index]: address }))} />
                      <AddressFields
                        address={additionalGuestAddresses[index] || emptyAddress()}
                        onChange={address => setAdditionalGuestAddresses(current => ({ ...current, [index]: address }))}
                        prefix={`additional-${index}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <AddressFields address={sharedAddress} onChange={setSharedAddress} prefix="shared" />
              )}
            </div>
          )}

          <label>Dietary restrictions<textarea name="dietary" placeholder="Allergies or dietary needs for anyone attending" rows={3} /></label>
          <label>Song request<input name="song" placeholder="What gets you on the dance floor?" /></label>
          <label>Anything else we should know?<textarea name="message" placeholder="Optional" rows={3} /></label>

          <div className="rsvp-summary">
            <strong>{attendingCount === 0 ? "Regretfully declining" : `${attendingCount} ${attendingCount === 1 ? "guest" : "guests"} attending`}</strong>
            <span>{selectedHousehold.reservedSeats} {selectedHousehold.reservedSeats === 1 ? "seat" : "seats"} available</span>
          </div>

          <button className="primary-button form-button" type="submit" disabled={submitting}>
            {submitting ? "Sending RSVP..." : "Send RSVP"}
          </button>
        </form>
      )}
    </section>
  );
}

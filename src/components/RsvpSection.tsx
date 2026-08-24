import { FormEvent, useState } from "react";
import { GOOGLE_SCRIPT_URL } from "../data/wedding";
import type { HouseholdResult } from "../types/rsvp";

export function RsvpSection() {
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HouseholdResult[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdResult | null>(null);
  const [attendingGuestIds, setAttendingGuestIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [street, setStreet] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const searchGuests = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchName.trim();
    if (!trimmed) return;
    setSearching(true); setSearchResults([]); setSelectedHousehold(null);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=search&name=${encodeURIComponent(trimmed)}`);
      const result = await response.json();
      if (!result.success) { alert(result.message || "Guest search failed."); return; }
      setSearchResults(result.results || []);
    } catch (error) { console.error("Guest search failed:", error); alert("We could not search the guest list. Please try again."); }
    finally { setSearching(false); }
  };

  const chooseHousehold = (household: HouseholdResult) => {
    setSelectedHousehold(household);
    setAttendingGuestIds(household.members.filter(member => member.rsvpStatus === "Accepted").map(member => member.guestId));
    setStreet(household.address?.street || ""); setLine2(household.address?.line2 || "");
    setCity(household.address?.city || ""); setState(household.address?.state || ""); setZip(household.address?.zip || "");
    setSearchResults([]);
  };

  const toggleGuest = (guestId: string) => setAttendingGuestIds(current => current.includes(guestId) ? current.filter(id => id !== guestId) : [...current, guestId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selectedHousehold) return;
    const formData = new FormData(event.currentTarget);
    const data = { household: selectedHousehold.household, primaryGuestId: selectedHousehold.primaryGuestId, attendingGuestIds,
      dietary: formData.get("dietary"), song: formData.get("song"), message: formData.get("message"), address: { street, line2, city, state, zip } };
    setSubmitting(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "RSVP submission failed.");
      setSubmitted(true);
    } catch (error) { console.error("RSVP submission failed:", error); alert("Something went wrong while submitting your RSVP. Please try again."); }
    finally { setSubmitting(false); }
  };

  const resetRsvp = () => {
    setSubmitted(false); setSearchName(""); setSearchResults([]); setSelectedHousehold(null); setAttendingGuestIds([]);
    setStreet(""); setLine2(""); setCity(""); setState(""); setZip("");
  };

  return <section className="rsvp section" id="rsvp">
    <div className="rsvp-copy"><p className="eyebrow">Kindly reply</p><h2>Will you be joining us?</h2><p>Please respond by May 1, 2027.</p><p className="small-note">Search for your name below to find your invitation. You will be able to RSVP for everyone included in your household.</p></div>
    {submitted ? <div className="confirmation"><span>✓</span><h3>Thank you!</h3><p>Your RSVP has been received. We cannot wait to celebrate with you!</p><button onClick={resetRsvp}>Submit another RSVP</button></div>
    : !selectedHousehold ? <div className="rsvp-lookup">
      <form className="rsvp-form" onSubmit={searchGuests}><label>Find your invitation<input value={searchName} onChange={e=>setSearchName(e.target.value)} required placeholder="Enter your name"/></label><button className="primary-button form-button" type="submit" disabled={searching}>{searching ? "Searching..." : "Find My Invitation"}</button></form>
      {searchResults.length > 0 && <div className="search-results"><p className="search-results-heading">We found:</p>{searchResults.map(result => <button type="button" className="household-result" key={result.primaryGuestId + result.household} onClick={()=>chooseHousehold(result)}><strong>{result.household}</strong><span className="invitation-count">{result.members.length === 1 ? "Individual invitation" : `${result.members.length} invited guests`}</span>{result.members.length > 1 && <span className="invitation-members">{result.members.map(member=>member.displayName).join(" · ")}</span>}</button>)}</div>}
      {!searching && searchName && searchResults.length === 0 && <p className="small-note">If you do not see your invitation, try searching using just your first or last name.</p>}
    </div>
    : <form className="rsvp-form household-rsvp" onSubmit={handleSubmit}>
      <div className="selected-household"><p className="eyebrow">Your invitation</p><h3>{selectedHousehold.household}</h3><button type="button" className="change-invitation" onClick={()=>{setSelectedHousehold(null);setAttendingGuestIds([])}}>Not your invitation? Search again</button></div>
      <fieldset className="guest-selection"><legend>Who will be attending?</legend><p className="small-note">Please check each person who will be joining us.</p>{selectedHousehold.members.map(member=><label className="guest-checkbox" key={member.guestId}><input type="checkbox" checked={attendingGuestIds.includes(member.guestId)} onChange={()=>toggleGuest(member.guestId)}/><span>{member.displayName}</span></label>)}</fieldset>
      {attendingGuestIds.length === 0 && <div className="decline-note"><strong>Unable to attend?</strong><p>Leave everyone unchecked and submit the form. We will record your household as regretfully declining.</p></div>}
      <div className="address-section"><div className="address-heading"><p className="eyebrow">Mailing address</p><h3>Where should we send wedding mail?</h3><p className="small-note">Please confirm the best address for invitations and thank-you cards.</p></div>
        <label>Street address<input value={street} onChange={e=>setStreet(e.target.value)} required autoComplete="street-address" placeholder="123 Main Street"/></label>
        <label>Apartment, unit, etc.<input value={line2} onChange={e=>setLine2(e.target.value)} autoComplete="address-line2" placeholder="Optional"/></label>
        <div className="address-grid"><label>City<input value={city} onChange={e=>setCity(e.target.value)} required autoComplete="address-level2"/></label><label>State<input value={state} onChange={e=>setState(e.target.value.toUpperCase().slice(0,2))} required maxLength={2} placeholder="MT" autoComplete="address-level1"/></label><label>ZIP<input value={zip} onChange={e=>setZip(e.target.value)} required inputMode="numeric" autoComplete="postal-code" placeholder="59715"/></label></div>
      </div>
      <label>Dietary restrictions<textarea name="dietary" placeholder="Allergies or dietary needs for anyone attending" rows={3}/></label>
      <label>Song request<input name="song" placeholder="What gets you on the dance floor?"/></label>
      <label>Anything else we should know?<textarea name="message" placeholder="Optional" rows={3}/></label>
      <div className="rsvp-summary"><strong>{attendingGuestIds.length === 0 ? "Regretfully declining" : `${attendingGuestIds.length} ${attendingGuestIds.length === 1 ? "guest" : "guests"} attending`}</strong></div>
      <button className="primary-button form-button" type="submit" disabled={submitting}>{submitting ? "Sending RSVP..." : "Send RSVP"}</button>
    </form>}
  </section>;
}

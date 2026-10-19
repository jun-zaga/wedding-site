import { FormEvent, useState } from "react";
import { GOOGLE_SCRIPT_URL } from "../data/wedding";
import type { HouseholdResult } from "../types/rsvp";

export function RsvpSection() {
  const [searchName, setSearchName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<HouseholdResult[]>([]);
  const [party, setParty] = useState<HouseholdResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [names, setNames] = useState<Record<string, {firstName: string; lastName: string}>>({});
  const [submitted, setSubmitted] = useState(false);
  const attendingIds = party?.members.filter(g => answers[g.guestId] === "Yes").map(g => g.guestId) || [];
  const choose = (value: HouseholdResult) => {
    setParty(value); setError(""); setResults([]); setNames({});
    setAnswers(Object.fromEntries(value.members.map(g => [g.guestId, g.attending || ""])));
  };
  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setResults([]); setSearched(false);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=search&name=${encodeURIComponent(searchName.trim())}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Search failed.");
      setResults(data.results || []); setSearched(true);
    } catch { setError("We could not search the guest list. Please try again."); }
    finally { setBusy(false); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!party || busy) return;
    if (party.members.some(g => !["Yes", "No"].includes(answers[g.guestId]))) {
      setError("Please choose attending or not attending for everyone on your invitation."); return;
    }
    const guestNames = party.members.filter(g => g.isUnnamed && answers[g.guestId] === "Yes")
      .map(g => ({guestId: g.guestId, firstName: (names[g.guestId]?.firstName || "").trim(), lastName: (names[g.guestId]?.lastName || "").trim()}));
    if (guestNames.some(g => !g.firstName || !g.lastName)) { setError("Please enter the first and last name of each unnamed guest attending."); return; }
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {method: "POST", body: JSON.stringify({
        primaryGuestId: party.primaryGuestId, attendingGuestIds: attendingIds, guestNames,
        dietary: form.get("dietary"), song: form.get("song"), message: form.get("message")
      })});
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Unable to save RSVP.");
      setSubmitted(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save RSVP. Please try again."); }
    finally { setBusy(false); }
  };
  return <section className="rsvp section" id="rsvp">
    <div className="rsvp-copy"><p className="eyebrow">Kindly reply</p><h2>Will you be joining us?</h2>
      <p>Please respond by April 1, 2027.</p><p className="small-note">Search for your name to see everyone included in your invitation. Plus-ones appear only when included in your invitation.</p></div>
    <div>
      {error && <p role="alert">{error}</p>}
      {submitted ? <div className="confirmation"><h3>Thank you!</h3><p>Your RSVP has been received.{attendingIds.length ? " We cannot wait to celebrate with you!" : " We will miss you!"}</p>
        <button type="button" onClick={() => {setSubmitted(false); setParty(null); setSearched(false); setSearchName("");}}>Return to search</button></div>
      : !party ? <div className="rsvp-lookup"><form className="rsvp-form" onSubmit={search}>
        <label>Find your invitation<input value={searchName} onChange={e => setSearchName(e.target.value)} required placeholder="Enter your name" /></label>
        <button className="primary-button form-button" disabled={busy}>{busy ? "Searching…" : "Find My Invitation"}</button></form>
        <div className="search-results">{results.map(result => <button type="button" className="household-result" key={result.primaryGuestId} onClick={() => choose(result)}>
          <strong>{result.household}</strong><span className="invitation-members">{result.members.map(g => g.displayName).join(" · ")}</span></button>)}</div>
        {searched && !results.length && <p role="status">No invitation found. Try your first or last name, or contact us for help.</p>}</div>
      : <form className="rsvp-form household-rsvp" onSubmit={submit}>
        <div className="selected-household"><p className="eyebrow">Your invitation</p><h3>{party.household}</h3>
          <button type="button" className="change-invitation" onClick={() => {setParty(null); setSearched(false); setError("");}}>Search again</button></div>
        <fieldset className="guest-selection"><legend>Who will be attending?</legend>
          {party.members.map(g => <div className="individual-address-card" key={g.guestId}>
            <label>{g.displayName}<select required value={answers[g.guestId] || ""} onChange={e => setAnswers(a => ({...a, [g.guestId]: e.target.value}))}>
              <option value="">Please choose</option><option value="Yes">Attending</option><option value="No">Not attending</option></select></label>
            {g.isUnnamed && answers[g.guestId] === "Yes" && <div className="address-grid">
              <label>Guest first name<input required maxLength={100} value={names[g.guestId]?.firstName || ""} onChange={e => setNames(n => ({...n, [g.guestId]: {...(n[g.guestId] || {firstName: "", lastName: ""}), firstName: e.target.value}}))} /></label>
              <label>Guest last name<input required maxLength={100} value={names[g.guestId]?.lastName || ""} onChange={e => setNames(n => ({...n, [g.guestId]: {...(n[g.guestId] || {firstName: "", lastName: ""}), lastName: e.target.value}}))} /></label></div>}
          </div>)}
        </fieldset>
        <label>Dietary restrictions<textarea name="dietary" /></label><label>Song request<input name="song" /></label><label>Message<textarea name="message" /></label>
        <button className="primary-button form-button" disabled={busy}>{busy ? "Saving…" : "Submit RSVP"}</button>
      </form>}
    </div>
  </section>;
}

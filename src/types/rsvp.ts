export type GuestMember = { guestId: string; displayName: string; rsvpStatus: string };
export type HouseholdResult = {
  household: string;
  primaryGuestId: string;
  reservedSeats: number;
  members: GuestMember[];
  address: { street: string; line2: string; city: string; state: string; zip: string };
};

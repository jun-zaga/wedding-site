export type MailingAddress = {
  street: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
};

export type GuestMember = {
  guestId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  rsvpStatus: string;
  address: MailingAddress;
};

export type AdditionalGuest = { name: string };

export type HouseholdResult = {
  household: string;
  primaryGuestId: string;
  reservedSeats: number;
  members: GuestMember[];
  addressCollectionMode: "Shared" | "Individual";
  address: MailingAddress;
};

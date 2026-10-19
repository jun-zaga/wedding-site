export type GuestMember = {
  guestId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  rsvpStatus: string;
  attending: string;
  isUnnamed: boolean;
};

export type HouseholdResult = {
  household: string;
  primaryGuestId: string;
  reservedSeats: number;
  members: GuestMember[];
};

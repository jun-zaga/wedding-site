export type ScheduleEvent = { time: string; title: string; detail?: string };
export type ScheduleDay = { day: string; date: string; events: ScheduleEvent[] };

export const WEDDING_DATE = new Date("2027-06-05T15:00:00-06:00");
export const AMAZON_REGISTRY_URL = "https://www.amazon.com/wedding/guest-view/1A5HNETHKG9HF";
export const VENUE_ADDRESS = "135 Hideaway Drive, Bozeman, MT 59718";
export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/oxgefjNVxgvxe9MH9";
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpi6FwXM41decufY7kqJUxQttYz_q19tyWq24OYiYOywHTIJphOgXBVY5lBiQlyMLn/exec";

export const scheduleDays: ScheduleDay[] = [
  { day: "Day One", date: "Friday · June 4, 2027", events: [
    { time: "12:00 PM", title: "Venue Opens", detail: "Come by, get settled, and hang out." },
    { time: "4:00 PM", title: "Venue Closes", detail: "Please return for the ceremony and reception tomorrow." }
  ]},
  { day: "Day Two", date: "Saturday · June 5, 2027", events: [
    { time: "3:30 PM", title: "Guests Arrive" },
    { time: "4:00 PM", title: "Ceremony" }, { time: "4:45 PM", title: "Cocktail Hour" },
    { time: "5:30 PM", title: "Dinner" }, { time: "6:00 PM", title: "Toasts & Speeches" },
    { time: "6:30 PM", title: "First Dance" }, { time: "6:45 PM", title: "Open Dancing" },
    { time: "8:00 PM", title: "Goodnight" }
  ]}
];

export const galleryPhotos = [
  ["/photos/bridge-kiss.jpg", "Jordan and Alexandra kissing on a wooden bridge"],
  ["/photos/champagne-pour.jpg", "Alexandra pouring champagne beside the lake"],
  ["/photos/champagne-toast.jpg", "Champagne glasses raised in front of the mountains"],
  ["/photos/bridge-embrace.jpg", "Jordan and Alexandra embracing on a mountain bridge"],
  ["/photos/proposal.jpg", "Proposal beside a mountain lake"],
  ["/photos/lakeside-lift.jpg", "Jordan lifting Alexandra beside the lake"],
  ["/photos/lakeside-dip.jpg", "A romantic dip beside the lake"],
  ["/photos/ring-hands.jpg", "Alexandra's engagement ring with the lake in the background"],
  ["/photos/lakeside-spin.jpg", "Jordan and Alexandra spinning together by the lake"],
  ["/photos/lake-embrace.jpg", "Jordan and Alexandra embracing with the mountain lake behind them"]
].map(([src, alt]) => ({ src, alt }));

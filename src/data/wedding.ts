export type ScheduleEvent = { time: string; title: string; detail?: string };
export type ScheduleDay = { day: string; date: string; events: ScheduleEvent[] };

export const WEDDING_DATE = new Date("2027-06-05T16:00:00");
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
    { time: "8:00 AM", title: "Getting Ready" }, { time: "2:30 PM", title: "Guests Arrive" },
    { time: "3:00 PM", title: "Ceremony" }, { time: "3:30 PM", title: "Cocktail Hour" },
    { time: "5:00 PM", title: "Dinner" }, { time: "6:00 PM", title: "Toasts & Speeches" },
    { time: "7:00 PM", title: "First Dance" }, { time: "7:30 PM", title: "Open Dancing" },
    { time: "11:30 PM", title: "Last Dance" }, { time: "12:00 AM", title: "Goodnight" }
  ]},
  { day: "Day Three", date: "Sunday · June 6, 2027 · Jordan and Alexandra Absent", events: [
    { time: "8:00 AM", title: "Cleanup" }, { time: "11:00 AM", title: "Farewells" }, { time: "12:00 PM", title: "Venue Close" }
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

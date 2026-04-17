// Each item: { id, label, modal }
// modal types:
//   null            → no modal at all
//   "vendor"        → Name, Email, Phone, Cost, Notes
//   "link"          → optional link + label, optional cost
//   "date"          → optional date field, optional cost
//   "budget"        → min + max budget
//   "delegates"     → dynamic table (name + assignment)
//   "vendors_table" → dynamic table (name, phone, email, type)
//   "custom"        → fully custom fields array

export const sections = [
  {
    id: "immediate", emoji: "✨", label: "Right Away", sublabel: "First 1–2 weeks", color: "#c9a96e",
    items: [
      { id: "announce",    label: "Announce your engagement to close family & friends", modal: null },
      { id: "social",      label: "Post your engagement on social media (if desired)",   modal: null },
      { id: "engphotos",   label: "Take engagement photos (even casual phone photos to start)", modal: null },
      { id: "budget",      label: "Set a rough budget for the wedding", modal: "budget" },
      {
        id: "vision", label: "Decide on a general vision: intimate, large, destination, backyard, venue, etc.",
        modal: "custom",
        fields: [{ key: "link", label: "Pinterest board link (optional)", placeholder: "Post a Pinterest board link if available", required: false, type: "url" }],
      },
      {
        id: "guestsize", label: "Discuss guest list size (rough number)",
        modal: "custom",
        fields: [{ key: "link", label: "Guest list link (optional)", placeholder: "Post link to guest list", required: false, type: "url" }],
      },
    ],
  },
  {
    id: "early", emoji: "📅", label: "Early Planning", sublabel: "1–3 months out", color: "#a8c5a0",
    items: [
      {
        id: "guestlist", label: "Create a full guest list with contact info",
        modal: "custom",
        fields: [{ key: "link", label: "Guest list link (optional)", placeholder: "Post link to guest list", required: false, type: "url" }],
      },
      {
        id: "venue", label: "Research and book your venue (venues book 12–18 months out)",
        modal: "custom",
        fields: [
          { key: "link", label: "Venue link (optional)", placeholder: "Post link to venue", required: false, type: "url" },
          { key: "cost", label: "Estimated cost", placeholder: "e.g. $8,000", required: true, type: "text" },
        ],
      },
      {
        id: "weddingdate", label: "Set your wedding date",
        modal: "custom",
        fields: [{ key: "date", label: "Wedding date", placeholder: "", required: true, type: "date" }],
      },
      {
        id: "planner", label: "Hire a wedding planner or day-of coordinator (if desired)",
        modal: "vendor",
      },
      { id: "weddingparty", label: "Choose and ask your wedding party (bridesmaids, groomsmen, etc.)", modal: null },
      { id: "photographer", label: "Book your photographer", modal: "vendor" },
      { id: "videographer",  label: "Book your videographer",  modal: "vendor" },
      { id: "officiant",     label: "Book your officiant",     modal: "vendor" },
      {
        id: "website", label: "Start building your wedding website",
        modal: "custom",
        fields: [{ key: "link", label: "Website link (optional)", placeholder: "Post link to site", required: false, type: "url" }],
      },
      {
        id: "honeymoonplan", label: "Begin honeymoon research and planning",
        modal: "custom",
        fields: [{ key: "notes", label: "Notes (optional)", placeholder: "Destinations, ideas, dates in mind…", required: false, type: "textarea" }],
      },
    ],
  },
  {
    id: "vendor", emoji: "🎶", label: "Vendors & Logistics", sublabel: "3–6 months out", color: "#9bb5d6",
    items: [
      { id: "caterer",      label: "Book caterer / finalize food and beverage package with venue", modal: "vendor" },
      { id: "dj",           label: "Book a band or DJ",            modal: "vendor" },
      { id: "florist",      label: "Book florist and discuss floral vision", modal: "vendor" },
      { id: "hairMakeup",   label: "Book hair & makeup artist(s)", modal: "vendor" },
      { id: "dress",        label: "Order wedding dress / suit / attire",   modal: null },
      { id: "partyAttire",  label: "Order wedding party attire",            modal: null },
      {
        id: "accommodations", label: "Book accommodations for out-of-town guests (hotel room block)",
        modal: "custom",
        fields: [
          { key: "link", label: "Booking details link (optional)", placeholder: "Optional link to booking details", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $1,200", required: false, type: "text" },
        ],
      },
      {
        id: "transport", label: "Book transportation (shuttle, limo, vintage car, etc.)",
        modal: "custom",
        fields: [
          { key: "link", label: "Booking details link (optional)", placeholder: "Optional link to booking details", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $800", required: false, type: "text" },
        ],
      },
      {
        id: "savedates", label: "Design and send save-the-dates",
        modal: "custom",
        fields: [
          { key: "link", label: "Ordering site link (optional)", placeholder: "Optional link to ordering site", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $150", required: false, type: "text" },
        ],
      },
      {
        id: "rehearsalvenue", label: "Research and book a rehearsal dinner venue",
        modal: "custom",
        fields: [
          { key: "date",     label: "Date (optional)",              placeholder: "", required: false, type: "date" },
          { key: "location", label: "Location (optional)",          placeholder: "e.g. The Grand Ballroom", required: false, type: "text" },
          { key: "cost",     label: "Cost / Price Paid (optional)", placeholder: "e.g. $2,000", required: false, type: "text" },
        ],
      },
      {
        id: "invitations", label: "Design and order wedding invitations",
        modal: "custom",
        fields: [
          { key: "link", label: "Ordering site link (optional)", placeholder: "Optional link to ordering site", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $300", required: false, type: "text" },
        ],
      },
      { id: "cake",         label: "Book a cake or dessert vendor", modal: "vendor" },
      {
        id: "insurance", label: "Research wedding insurance",
        modal: "custom",
        fields: [
          { key: "link", label: "Insurance site link (optional)", placeholder: "Optional link to insurance site", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)",   placeholder: "e.g. $500", required: false, type: "text" },
        ],
      },
      { id: "honeymoonbook", label: "Book honeymoon travel (flights, hotels, activities)", modal: null },
      { id: "passports",     label: "Apply for passports if needed for honeymoon",          modal: null },
    ],
  },
  {
    id: "details", emoji: "💌", label: "The Details", sublabel: "4–6 months out", color: "#c9a0c5",
    items: [
      {
        id: "registry", label: "Create your wedding registry",
        modal: "custom",
        fields: [{ key: "link", label: "Registry link (optional)", placeholder: "Add link to registry", required: false, type: "url" }],
      },
      { id: "mailinvites",   label: "Mail wedding invitations (6–8 weeks before wedding)", modal: null },
      { id: "vows",          label: "Plan ceremony structure and write vows (if personal vows)", modal: null },
      { id: "music",         label: "Choose readings and music for ceremony", modal: null },
      { id: "programs",      label: "Design ceremony programs",               modal: null },
      { id: "rehearsalguest",label: "Plan rehearsal dinner guest list and details", modal: null },
      {
        id: "favors", label: "Choose and order wedding favors",
        modal: "custom",
        fields: [
          { key: "link", label: "Links (optional)", placeholder: "Optional links", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $200", required: false, type: "text" },
        ],
      },
      { id: "seating",     label: "Design seating chart (after RSVPs are in)", modal: null },
      {
        id: "namecards", label: "Order name cards / place cards",
        modal: "custom",
        fields: [
          { key: "link", label: "Links (optional)", placeholder: "Optional links", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $80", required: false, type: "text" },
        ],
      },
      { id: "timeline", label: "Plan day-of timeline with all vendors", modal: null },
      {
        id: "menucard", label: "Design or order a wedding menu card",
        modal: "custom",
        fields: [
          { key: "link", label: "Confirmation links (optional)", placeholder: "Optional confirmation links", required: false, type: "url" },
          { key: "cost", label: "Cost / Price Paid (optional)",  placeholder: "e.g. $100", required: false, type: "text" },
        ],
      },
      { id: "bands", label: "Purchase wedding bands", modal: null },
      {
        id: "engSession", label: "Schedule engagement photo session (if doing formal ones)",
        modal: "custom",
        fields: [
          { key: "date", label: "Date (optional)", placeholder: "", required: false, type: "date" },
          { key: "cost", label: "Cost / Price Paid (optional)", placeholder: "e.g. $500", required: false, type: "text" },
        ],
      },
      { id: "childcare", label: "Arrange for childcare at wedding if needed", modal: null },
    ],
  },
  {
    id: "finalstretch", emoji: "🏁", label: "Final Stretch", sublabel: "1–2 months out", color: "#d6a88e",
    items: [
      { id: "rsvp",          label: "Track RSVPs and follow up with non-responders", modal: null },
      { id: "headcount",     label: "Finalize headcount and share with caterer",      modal: null },
      { id: "seatfinal",     label: "Finalize seating chart",                         modal: null },
      { id: "confirmvendors",label: "Confirm all vendor bookings with final details",  modal: null },
      {
        id: "dressfitting", label: "Schedule final dress fitting",
        modal: "custom",
        fields: [{ key: "date", label: "Date (optional)", placeholder: "", required: false, type: "date" }],
      },
      {
        id: "license", label: "Apply for marriage license (check local requirements for timing)",
        modal: "custom",
        fields: [{ key: "date", label: "Appointment date (optional)", placeholder: "", required: false, type: "date" }],
      },
      { id: "payments",  label: "Prepare vendor payment schedule and tip envelopes",     modal: null },
      { id: "delegates", label: "Delegate wedding-day tasks to trusted people",           modal: "delegates" },
      { id: "kitlist",   label: "Write a day-of emergency kit list",                      modal: null },
      { id: "vendorsheet",label: "Create a vendor contact sheet for day-of coordinator or wedding party", modal: "vendors_table" },
    ],
  },
  {
    id: "week", emoji: "🌹", label: "Wedding Week", sublabel: "7 days before", color: "#e8a0a0",
    items: [
      { id: "confirmfinal", label: "Confirm all vendors one final time",              modal: null },
      { id: "payments2",    label: "Deliver final payments and tip envelopes",         modal: null },
      {
        id: "rehearsal", label: "Hold wedding rehearsal",
        modal: "custom",
        fields: [{ key: "date", label: "Rehearsal date (optional)", placeholder: "", required: false, type: "date" }],
      },
      { id: "rehearsaldinner", label: "Attend rehearsal dinner",                      modal: null },
      { id: "vows2",           label: "Prepare personal vows and speeches (print copies!)", modal: null },
      { id: "honeymoonpack",   label: "Pack for honeymoon",                            modal: null },
      { id: "rings",           label: "Hand off rings to best man / maid of honor",    modal: null },
    ],
  },
  {
    id: "after", emoji: "🎊", label: "After the Wedding", sublabel: "Post-ceremony", color: "#a0c5c5",
    items: [
      { id: "thankyou",      label: "Send thank-you notes (aim for within 3 months)", modal: null },
      { id: "rentals",       label: "Return any rentals",                              modal: null },
      { id: "dresssave",     label: "Preserve your wedding dress",                    modal: null },
      { id: "namechange",    label: "Name change — SSN, license, passport, bank accounts", modal: null },
      { id: "tip",           label: "Review and tip vendors (if not done already)",   modal: null },
      { id: "reviews",       label: "Leave reviews for vendors",                      modal: null },
      { id: "photos",        label: "Share wedding photos",                           modal: null },
      { id: "beneficiaries", label: "Update beneficiaries on insurance and financial accounts", modal: null },
      { id: "finances",      label: "Update financial plans as a couple",             modal: null },
    ],
  },
];

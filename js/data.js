/*
  ACIS Digital Archive — mock data
  --------------------------------
  This file simulates the item-level metadata that, in production,
  would be pulled from Omeka Classic (collections + items) with each
  item's digital object hosted in the Stanford Digital Repository (SDR).

  Every record intentionally mirrors an Omeka "Item" with Dublin-Core-style
  fields (title, date, type, description) plus a "collection" grouping,
  a page count, keywords for search, and a placeholder SDR PURL.

  NOTE: This is illustrative mock content for prototyping only. It does
  not represent verified historical ACIS records.
*/

const ACIS_COLLECTIONS = [
  {
    slug: "amicus-briefs",
    name: "Amicus Briefs",
    officialCount: 12,
    description:
      "Amicus curiae briefs filed by or associated with the American Committee for Interoperable Systems in litigation concerning software interoperability, copyright, and competition.",
  },
  {
    slug: "meeting-notes",
    name: "Meeting Notes",
    officialCount: 13,
    description:
      "Meeting notes documenting the activities, discussions, and organizational work of the American Committee for Interoperable Systems.",
  },
  {
    slug: "letters",
    name: "Letters",
    officialCount: 30,
    description:
      "Correspondence to and from ACIS members, allied organizations, government offices, and industry contacts regarding interoperability policy and advocacy.",
  },
  {
    slug: "comments",
    name: "Comments",
    officialCount: 20,
    description:
      "Formal comments and submissions prepared by ACIS in response to regulatory proceedings, standard-setting processes, and public policy consultations.",
  },
  {
    slug: "other",
    name: "Other",
    officialCount: 20,
    description:
      "Additional archival materials associated with ACIS, including reports, notes, and miscellaneous organizational records that do not fall under another collection.",
  },
];

// Helper to build a stable, readable id
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RAW_ITEMS = [
  // ---------------- AMICUS BRIEFS ----------------
  {
    title: "ACIS Amicus Brief — Software Interface Copyrightability",
    type: "Amicus Briefs",
    date: "March 1990",
    dateSort: "1990-03-01",
    pages: 42,
    description:
      "Brief submitted on behalf of ACIS addressing the copyrightability of software interfaces and the implications for interoperable product development.",
    keywords: ["copyright", "interfaces", "interoperability", "litigation"],
  },
  {
    title: "ACIS Amicus Brief — Reverse Engineering and Fair Use",
    type: "Amicus Briefs",
    date: "September 1991",
    dateSort: "1991-09-01",
    pages: 38,
    description:
      "Brief discussing reverse engineering practices as a means of achieving interoperability and their treatment under fair use doctrine.",
    keywords: ["reverse engineering", "fair use", "interoperability"],
  },
  {
    title: "ACIS Amicus Brief — Interoperability and Antitrust Considerations",
    type: "Amicus Briefs",
    date: "June 1993",
    dateSort: "1993-06-01",
    pages: 55,
    description:
      "Brief examining competition-policy concerns raised by restrictions on interoperability between computer systems and software products.",
    keywords: ["antitrust", "competition", "interoperability", "standards"],
  },
  {
    title: "ACIS Amicus Brief — Look and Feel Litigation",
    type: "Amicus Briefs",
    date: "January 1994",
    dateSort: "1994-01-01",
    pages: 47,
    description:
      "Brief addressing the scope of copyright protection for user-interface elements commonly described as a program's \"look and feel.\"",
    keywords: ["copyright", "user interface", "litigation"],
  },
  {
    title: "ACIS Amicus Brief — Menu Command Hierarchies",
    type: "Amicus Briefs",
    date: "November 1994",
    dateSort: "1994-11-01",
    pages: 33,
    description:
      "Brief concerning the copyright status of menu command hierarchies and their role in enabling compatible software applications.",
    keywords: ["copyright", "menu structures", "interoperability"],
  },
  {
    title: "ACIS Amicus Brief — Application Programming Interfaces",
    type: "Amicus Briefs",
    date: "April 1996",
    dateSort: "1996-04-01",
    pages: 61,
    description:
      "Brief addressing the treatment of application programming interfaces (APIs) under copyright law and their significance for interoperable systems.",
    keywords: ["APIs", "copyright", "interoperability", "standards"],
  },
  {
    title: "ACIS Amicus Brief — Standards Essential Technology",
    type: "Amicus Briefs",
    date: "February 1998",
    dateSort: "1998-02-01",
    pages: 40,
    description:
      "Brief exploring licensing obligations associated with technology deemed essential to widely adopted industry standards.",
    keywords: ["standards", "licensing", "technology policy"],
  },

  // ---------------- MEETING NOTES ----------------
  {
    title: "ACIS Meeting Notes — January 1985",
    type: "Meeting Notes",
    date: "January 1985",
    dateSort: "1985-01-01",
    pages: 300,
    description:
      "Meeting notes documenting discussions concerning interoperability, standards, policy, and organizational activities.",
    keywords: ["interoperability", "policy", "organizational activities"],
  },
  {
    title: "ACIS Meeting Notes — May 1985",
    type: "Meeting Notes",
    date: "May 1985",
    dateSort: "1985-05-01",
    pages: 210,
    description:
      "Notes from a general membership meeting covering committee priorities and updates on pending litigation of interest to members.",
    keywords: ["membership", "litigation update", "priorities"],
  },
  {
    title: "ACIS Meeting Notes — October 1986",
    type: "Meeting Notes",
    date: "October 1986",
    dateSort: "1986-10-01",
    pages: 175,
    description:
      "Meeting notes recording discussion of proposed standards initiatives and coordination with allied industry organizations.",
    keywords: ["standards", "coordination", "industry organizations"],
  },
  {
    title: "ACIS Meeting Notes — February 1988",
    type: "Meeting Notes",
    date: "February 1988",
    dateSort: "1988-02-01",
    pages: 190,
    description:
      "Notes covering committee positions on interoperability policy ahead of scheduled regulatory comment deadlines.",
    keywords: ["policy", "regulatory comment", "interoperability"],
  },
  {
    title: "ACIS Meeting Notes — July 1989",
    type: "Meeting Notes",
    date: "July 1989",
    dateSort: "1989-07-01",
    pages: 230,
    description:
      "Meeting notes documenting budget matters, membership updates, and a review of ongoing advocacy efforts.",
    keywords: ["budget", "membership", "advocacy"],
  },
  {
    title: "ACIS Meeting Notes — March 1991",
    type: "Meeting Notes",
    date: "March 1991",
    dateSort: "1991-03-01",
    pages: 260,
    description:
      "Notes recording discussion of amicus strategy in interoperability-related litigation and coordination with counsel.",
    keywords: ["amicus strategy", "litigation", "counsel"],
  },
  {
    title: "ACIS Meeting Notes — September 1992",
    type: "Meeting Notes",
    date: "September 1992",
    dateSort: "1992-09-01",
    pages: 205,
    description:
      "Meeting notes summarizing member reports on interoperability developments across the computer industry.",
    keywords: ["member reports", "industry developments"],
  },
  {
    title: "ACIS Meeting Notes — April 1994",
    type: "Meeting Notes",
    date: "April 1994",
    dateSort: "1994-04-01",
    pages: 240,
    description:
      "Notes covering discussion of proposed legislative language affecting software interoperability and technical standards.",
    keywords: ["legislation", "technical standards", "interoperability"],
  },
  {
    title: "ACIS Meeting Notes — November 1996",
    type: "Meeting Notes",
    date: "November 1996",
    dateSort: "1996-11-01",
    pages: 180,
    description:
      "Meeting notes documenting year-end organizational review and planning for upcoming policy engagement.",
    keywords: ["organizational review", "policy engagement"],
  },

  // ---------------- LETTERS ----------------
  {
    title: "ACIS Letter — March 1986",
    type: "Letters",
    date: "March 1986",
    dateSort: "1986-03-01",
    pages: 4,
    description:
      "Letter to an allied industry association regarding coordinated advocacy on interoperability and open technical standards.",
    keywords: ["correspondence", "industry association", "standards"],
  },
  {
    title: "ACIS Letter — August 1986",
    type: "Letters",
    date: "August 1986",
    dateSort: "1986-08-01",
    pages: 3,
    description:
      "Letter addressed to a federal agency commenting on a proposed rulemaking with implications for computer system interoperability.",
    keywords: ["federal agency", "rulemaking", "interoperability"],
  },
  {
    title: "ACIS Letter — January 1988",
    type: "Letters",
    date: "January 1988",
    dateSort: "1988-01-01",
    pages: 2,
    description:
      "Letter to a member organization outlining committee positions on pending interoperability litigation.",
    keywords: ["member organization", "litigation", "positions"],
  },
  {
    title: "ACIS Letter — June 1989",
    type: "Letters",
    date: "June 1989",
    dateSort: "1989-06-01",
    pages: 5,
    description:
      "Letter responding to an inquiry from a congressional office regarding software interoperability and competition policy.",
    keywords: ["congressional office", "competition policy"],
  },
  {
    title: "ACIS Letter — October 1990",
    type: "Letters",
    date: "October 1990",
    dateSort: "1990-10-01",
    pages: 3,
    description:
      "Letter to legal counsel providing background materials in support of an amicus filing on interface copyrightability.",
    keywords: ["legal counsel", "amicus filing", "copyrightability"],
  },
  {
    title: "ACIS Letter — February 1992",
    type: "Letters",
    date: "February 1992",
    dateSort: "1992-02-01",
    pages: 4,
    description:
      "Letter to a standards body regarding participation in a technical working group on interoperable data formats.",
    keywords: ["standards body", "working group", "data formats"],
  },
  {
    title: "ACIS Letter — May 1993",
    type: "Letters",
    date: "May 1993",
    dateSort: "1993-05-01",
    pages: 2,
    description:
      "Letter to member companies summarizing recent developments in interoperability-related antitrust proceedings.",
    keywords: ["member companies", "antitrust", "proceedings"],
  },
  {
    title: "ACIS Letter — December 1994",
    type: "Letters",
    date: "December 1994",
    dateSort: "1994-12-01",
    pages: 3,
    description:
      "Letter to a European policy contact regarding coordination on interoperability directives under consideration abroad.",
    keywords: ["Europe", "policy", "interoperability directive"],
  },
  {
    title: "ACIS Letter — July 1995",
    type: "Letters",
    date: "July 1995",
    dateSort: "1995-07-01",
    pages: 4,
    description:
      "Letter responding to press inquiries regarding the committee's position on application programming interface protection.",
    keywords: ["press inquiry", "APIs", "position"],
  },
  {
    title: "ACIS Letter — March 1997",
    type: "Letters",
    date: "March 1997",
    dateSort: "1997-03-01",
    pages: 2,
    description:
      "Letter to a fellow advocacy organization proposing joint comments on a pending standards-related proceeding.",
    keywords: ["advocacy organization", "joint comments", "standards"],
  },
  {
    title: "ACIS Letter — September 1998",
    type: "Letters",
    date: "September 1998",
    dateSort: "1998-09-01",
    pages: 3,
    description:
      "Letter summarizing the committee's activities for the year and thanking members for continued participation.",
    keywords: ["annual summary", "membership", "participation"],
  },

  // ---------------- COMMENTS ----------------
  {
    title: "ACIS Comments on Interoperability",
    type: "Comments",
    date: "April 1987",
    dateSort: "1987-04-01",
    pages: 18,
    description:
      "Formal comments submitted in a regulatory proceeding addressing barriers to interoperability among computer systems.",
    keywords: ["regulatory proceeding", "interoperability", "barriers"],
  },
  {
    title: "ACIS Comments on Proposed Technical Standards",
    type: "Comments",
    date: "November 1989",
    dateSort: "1989-11-01",
    pages: 22,
    description:
      "Comments responding to a proposed technical standard, with recommendations to preserve interoperable implementations.",
    keywords: ["technical standards", "recommendations", "implementation"],
  },
  {
    title: "ACIS Comments on Software Licensing Practices",
    type: "Comments",
    date: "August 1991",
    dateSort: "1991-08-01",
    pages: 27,
    description:
      "Comments addressing licensing practices that the committee argued could impede interoperability across platforms.",
    keywords: ["licensing", "platforms", "interoperability"],
  },
  {
    title: "ACIS Comments on Competition Policy Review",
    type: "Comments",
    date: "May 1993",
    dateSort: "1993-05-15",
    pages: 31,
    description:
      "Comments submitted as part of a broader competition policy review concerning the computer software industry.",
    keywords: ["competition policy", "software industry", "review"],
  },
  {
    title: "ACIS Comments on Interface Specification Access",
    type: "Comments",
    date: "February 1995",
    dateSort: "1995-02-01",
    pages: 19,
    description:
      "Comments urging continued access to interface specifications necessary for developing compatible software products.",
    keywords: ["interface specification", "access", "compatibility"],
  },
  {
    title: "ACIS Comments on International Standards Coordination",
    type: "Comments",
    date: "October 1996",
    dateSort: "1996-10-01",
    pages: 24,
    description:
      "Comments addressing coordination between domestic and international bodies on interoperability-related standards.",
    keywords: ["international standards", "coordination", "interoperability"],
  },
  {
    title: "ACIS Comments on Draft Interoperability Framework",
    type: "Comments",
    date: "June 1998",
    dateSort: "1998-06-01",
    pages: 29,
    description:
      "Comments on a draft framework intended to guide future policy on software and systems interoperability.",
    keywords: ["framework", "policy", "interoperability"],
  },

  // ---------------- OTHER ----------------
  {
    title: "ACIS Organizational Report — 1986",
    type: "Other",
    date: "1986",
    dateSort: "1986-01-01",
    pages: 12,
    description:
      "Annual organizational report summarizing membership, finances, and advocacy activities for the year.",
    keywords: ["annual report", "membership", "finances"],
  },
  {
    title: "ACIS Press Statement — Interoperability Ruling",
    type: "Other",
    date: "July 1990",
    dateSort: "1990-07-01",
    pages: 3,
    description:
      "Press statement responding to a court ruling with significance for the interoperability of computer systems.",
    keywords: ["press statement", "court ruling", "interoperability"],
  },
  {
    title: "ACIS Membership Directory — 1991",
    type: "Other",
    date: "1991",
    dateSort: "1991-01-01",
    pages: 8,
    description:
      "Directory listing member organizations of the American Committee for Interoperable Systems.",
    keywords: ["membership directory", "organizations"],
  },
  {
    title: "ACIS Conference Program — Interoperability Symposium",
    type: "Other",
    date: "September 1993",
    dateSort: "1993-09-01",
    pages: 14,
    description:
      "Program materials for a symposium on interoperability co-organized with allied industry and academic participants.",
    keywords: ["symposium", "conference", "interoperability"],
  },
  {
    title: "ACIS Newsletter — Winter 1995",
    type: "Other",
    date: "Winter 1995",
    dateSort: "1995-01-01",
    pages: 6,
    description:
      "Newsletter distributed to members summarizing recent policy developments and committee activities.",
    keywords: ["newsletter", "policy developments", "activities"],
  },
  {
    title: "ACIS Organizational Report — 1997",
    type: "Other",
    date: "1997",
    dateSort: "1997-01-01",
    pages: 15,
    description:
      "Annual organizational report summarizing membership, finances, and advocacy activities for the year.",
    keywords: ["annual report", "membership", "finances"],
  },
];

// Build final items array with ids, collection slugs, and PURLs
const ACIS_ITEMS = RAW_ITEMS.map((item, index) => {
  const collection = ACIS_COLLECTIONS.find((c) => c.name === item.type);
  const id = `${slugify(item.title)}-${index}`;
  return {
    id,
    ...item,
    collectionSlug: collection ? collection.slug : "other",
    purl: `https://purl.stanford.edu/example${String(index + 1).padStart(3, "0")}`,
  };
});

function getCollectionBySlug(slug) {
  return ACIS_COLLECTIONS.find((c) => c.slug === slug);
}

function getItemsByCollectionSlug(slug) {
  return ACIS_ITEMS.filter((i) => i.collectionSlug === slug);
}

function getItemById(id) {
  return ACIS_ITEMS.find((i) => i.id === id);
}

function totalOfficialCount() {
  return ACIS_COLLECTIONS.reduce((sum, c) => sum + c.officialCount, 0);
}

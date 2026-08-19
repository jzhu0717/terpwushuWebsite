export const NON_COLLEGIATE_AGE_GROUPS = [
    "Child (Up to 6 Years Old)",
    "Youth (Up to 8 Years Old)",
    "Group C (Up to 11 Years Old)",
    "Group B (Up to 14 Years Old)",
    "Group A (Up to 17 Years Old)",
    "Adult I (Ages 18-30)",
    "Adult II (Ages 30+)",
];

export const COLLEGIATE_AGE_GROUPS = [
    "Adult I (Ages 18-30)",
    "Adult II (Ages 30+)",
];

export const WUSHU_SCHOOLS = [
    "Full Circle Martial Arts Academy",
    "Goh's Kung Fu",
    "GOSU Inst. Chinese Martial Arts",
    "Hao Taichi Wellness",
    "NOVA Wushu Academy",
    "O-mei Wushu Center",
    "Professional Martial Arts Academy",
    "Taichi Kung-Fu Academy",
    "United States Wushu Academy",
    "Win-Win KungFu Culture Center",
    "Wushu Kung Fu Fitness Center",
    "Wushu Taekwon-Do Academy",
    "Zen Wushu Academy",
    "No School",
    "Other",
];

export const COLLEGES = [
    "Boston University",
    "Columbia University",
    "Cornell University",
    "George Mason University",
    "Georgia Institute of Technology",
    "Harvard University",
    "Illinois University",
    "Massachusetts Institute of Technology",
    "Northern Arizona University",
    "Ohio State University",
    "Rutgers University",
    "San Jose State University",
    "Stanford University",
    "University of California, Berkeley",
    "University of California, Davis",
    "University of California, Irvine",
    "University of California, Los Angeles",
    "University of California, San Diego",
    "University of Houston",
    "University of Maryland College Park",
    "University of Maryland Baltimore County",
    "University of Massachusetts Amherst",
    "University of Oregon",
    "University of Pittsburgh",
    "University of Texas at Austin",
    "University of Virginia",
    "University of Washington",
    "Virginia Commonwealth University",
    "Virginia Tech",
    "Wellesley College",
    "Yale University",
    "Other",
];

export const ALL_AGE_GROUPS = [...new Set([...NON_COLLEGIATE_AGE_GROUPS, ...COLLEGIATE_AGE_GROUPS])];
export const ALL_INSTITUTIONS = [...new Set([...WUSHU_SCHOOLS, ...COLLEGES])];

export const GRAND_CHAMPION_MIN_EVENTS = 4;
export const MAX_EVENTS_PER_REGISTRANT = 5;

// Age groups that represent a competitor under 18 — drives which waiver text applies and
// whether a Parent/Guardian signature is required, both at registration and at check-in.
export const MINOR_AGE_GROUPS = new Set([
    "Child (Up to 6 Years Old)",
    "Youth (Up to 8 Years Old)",
    "Group C (Up to 11 Years Old)",
    "Group B (Up to 14 Years Old)",
    "Group A (Up to 17 Years Old)",
]);

export const PAYMENT_METHODS = ["Credit/Debit Card", "Check", "Cash", "PayPal", "Zelle", "Venmo"];

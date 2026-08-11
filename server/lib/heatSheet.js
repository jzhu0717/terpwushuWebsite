const EXPERIENCE_ABBREVIATIONS = { Beginner: "Beg", Intermediate: "Int", Advanced: "Adv" };

const EVENT_ABBREVIATIONS = {
  "ChangQuan (Longfist)": "CQ",
  "NanQuan (Southern Fist)": "NQ",
  "JianShu (Straightsword)": "JS",
  "DaoShu (Broadsword)": "DS",
  "NanDao (Southern Broadsword)": "ND",
  "GunShu (Staff)": "GS",
  "QiangShu (Spear)": "QS",
  "NanGun (Southern Staff)": "NG",
  "Taiji Barehand": "Taiji BH",
  "Taiji 24-Form": "Taiji 24",
  "Taiji Weapon": "Taiji Weapon",
  "Trad/Other Barehand": "Trad/Other BH",
  "Trad/Other Weapon": "Trad/Other Weapon",
  "ChangQuan w/ Nandu": "CQ",
  "NanQuan w/ Nandu": "NQ",
  "Taiji Barehand w/ Nandu": "Taiji BH",
};

const COMPULSORY_CATEGORIES = new Set(["Group A Compulsory", "Group B Compulsory", "Group C Compulsory"]);

function categoryLabel(category) {
  if (COMPULSORY_CATEGORIES.has(category)) return "Comp";
  if (category === "Nandu Events") return "Nandu";
  return null;
}

function ageGroupShort(ageGroup) {
  return String(ageGroup || "").split(" (")[0];
}


function bucketInfo(registration, event) {
  const label = categoryLabel(event.category);
  const ageGroupDisplay = label === "Nandu" ? "Open" : ageGroupShort(registration.age_group);
  const exp = EXPERIENCE_ABBREVIATIONS[registration.experience_level] || registration.experience_level;
  const eventAbbrev = EVENT_ABBREVIATIONS[event.name] || event.name;
  const eventToken = label ? `${eventAbbrev} ${label}` : eventAbbrev;
  const displayLabel = `${ageGroupDisplay} ${exp} ${eventToken} ${registration.gender}`;
  const key = `${event.id}::${ageGroupDisplay}::${registration.experience_level}::${registration.gender}`;

  const defaultSession = label !== "Nandu" && ageGroupDisplay.startsWith("Adult") ? "afternoon" : "morning";
  return { key, displayLabel, ageGroupDisplay, defaultSession };
}

function formatEntryLine(registration, event) {
  const { displayLabel } = bucketInfo(registration, event);
  return `${displayLabel} - ${registration.first_name} ${registration.last_name}`;
}

module.exports = { EXPERIENCE_ABBREVIATIONS, EVENT_ABBREVIATIONS, categoryLabel, ageGroupShort, bucketInfo, formatEntryLine };

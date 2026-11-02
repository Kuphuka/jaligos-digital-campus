export const blackFridayCoursePrices = [
  { title: "SHEMTRAC Level 5", price: 3500 },
  { title: "Home Based Care Level 3", price: 4500 },
  { title: "Occupational Certificate ISO45001:2018 Level 5", price: 2400 },
  { title: "Working at Height Level 1", price: 1350 },
  { title: "SHE Representative Level 2", price: 900 },
  { title: "Legal Liability for Workplace Level 3", price: 900 },
  { title: "Hazard Identification & Risk Assessment Level 3", price: 900 },
  { title: "Incident Investigation Level 3", price: 900 },
  { title: "4-in-1 Compliance Combo", price: 2500 },
  { title: "4-in-1 Safety Combo", price: 3600 },
] as const;

export function formatCoursePrice(price: number) {
  return `R${new Intl.NumberFormat("en-ZA").format(price)}`;
}

export function getCoursePrice(title: string, level: string | null, databasePrice: number | null) {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedTitle = normalize(title);
  const normalizedLevel = level ? normalize(level) : "";

  const legacyPrices: Record<string, number> = {
    "shemtrac": 3500,
    "caregiver level 3": 4500,
    "she representative": 900,
  };
  if (legacyPrices[normalizedTitle] !== undefined) return legacyPrices[normalizedTitle];

  const promoCourse = blackFridayCoursePrices.find((course) => {
    const levelMatch = course.title.match(/ Level \d+$/);
    const baseTitle = levelMatch ? course.title.slice(0, -levelMatch[0].length) : course.title;
    return normalize(course.title) === normalizedTitle
      || (normalize(baseTitle) === normalizedTitle && (!normalizedLevel || normalizedLevel === normalize(levelMatch?.[0].trim() ?? "")));
  });

  return promoCourse?.price ?? databasePrice;
}

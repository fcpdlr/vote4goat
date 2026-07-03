export const SPORTS = {
  football: {
    entityCategoryId: 1,
    label: "Football",
    metaTitle: "Football GOAT Ranking | Vote4GOAT",
    metaDesc: "Vote in 1v1 duels and shape the all-time football GOAT ranking. Updated in real time with every vote.",
    canonical: "https://vote4goat.com/football",
    shareTag: "#Vote4GOAT #GOAT #Football",
  },
  basketball: {
    entityCategoryId: 2,
    label: "Basketball",
    metaTitle: "Basketball GOAT Ranking | Vote4GOAT",
    metaDesc: "Vote in 1v1 duels and shape the all-time basketball GOAT ranking. Updated in real time with every vote.",
    canonical: "https://vote4goat.com/basketball",
    shareTag: "#Vote4GOAT #GOAT #Basketball",
  },
}

export function sportForCategoryId(entityCategoryId) {
  return Object.keys(SPORTS).find((key) => SPORTS[key].entityCategoryId === entityCategoryId)
}

export type Species = {
  id: number;
  name: string;
  latin: string;
  category: string;
  habitat: string;
  diet: string;
  role: string;
  fact: string;
  pet: string;
  type: string;
  color: string;
  source: string;
};
export const species: Species[] = [
  {
    id: 0,
    name: "Rainbow Lorikeet",
    latin: "Trichoglossus moluccanus",
    category: "Birds",
    habitat: "Woodlands & urban gardens",
    diet: "Nectar, pollen & fruit",
    role: "Flower visitor",
    fact: "A brush-tipped tongue helps collect nectar and pollen.",
    pet: "Pipwing",
    type: "Nectar Guardian",
    color: "#b2c2fa",
    source: "https://birdlife.org.au/bird-profiles/rainbow-lorikeet/",
  },
  {
    id: 1,
    name: "Superb Fairywren",
    latin: "Malurus cyaneus",
    category: "Birds",
    habitat: "Dense shrubs & gardens",
    diet: "Small insects",
    role: "Insect eater",
    fact: "Breeding males wear striking blue plumage.",
    pet: "Bramblewisp",
    type: "Thicket Keeper",
    color: "#a1d8e8",
    source: "https://birdlife.org.au/bird-profiles/superb-fairy-wren/",
  },
  {
    id: 2,
    name: "Golden Wattle",
    latin: "Acacia pycnantha",
    category: "Plants",
    habitat: "Open forest & woodland",
    diet: "Sunlight, water & nutrients",
    role: "Flowering native plant",
    fact: "Golden wattle is Australia’s national floral emblem.",
    pet: "Wattlet",
    type: "Sunlit Sprout",
    color: "#f4d788",
    source: "https://www.anbg.gov.au/acacia/species/A-pycnantha.html",
  },
  {
    id: 3,
    name: "Blue-banded Bee",
    latin: "Amegilla cingulata",
    category: "Insects",
    habitat: "Gardens & open woodland",
    diet: "Nectar & pollen",
    role: "Pollinator",
    fact: "Blue-banded bees can release pollen by vibrating flowers.",
    pet: "Bumbloom",
    type: "Blossom Keeper",
    color: "#b2d9db",
    source: "https://www.aussiebee.com.au/blue-banded-bee-information.html",
  },
  {
    id: 4,
    name: "Laughing Kookaburra",
    latin: "Dacelo novaeguineae",
    category: "Birds",
    habitat: "Woodlands & open forests",
    diet: "Insects & small animals",
    role: "Predator",
    fact: "Its familiar call sounds like a rolling laugh.",
    pet: "Chuckleroot",
    type: "Woodland Watcher",
    color: "#d5bda0",
    source: "https://birdlife.org.au/bird-profiles/laughing-kookaburra/",
  },
  {
    id: 5,
    name: "Tasmanian Blue Gum",
    latin: "Eucalyptus globulus",
    category: "Plants",
    habitat: "Temperate forest",
    diet: "Sunlight, water & nutrients",
    role: "Habitat-forming tree",
    fact: "This eucalypt is Tasmania’s floral emblem.",
    pet: "Mistleaf",
    type: "Forest Dreamer",
    color: "#b8d2bb",
    source: "https://www.anbg.gov.au/emblems/tas.emblem.html",
  },
];

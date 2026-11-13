/**
 * Bibliography used by the site. Every educational statement cites ids from this list.
 * Bibliographic details were checked against Crossref / PubMed during research; see
 * docs/research/scientific-references.md for how much of each source was actually read.
 */
export interface Reference {
  id: string;
  authors: string;
  year: number | string;
  title: string;
  source: string;
  url?: string;
  kind: 'peer-reviewed' | 'book' | 'museum' | 'database';
  /** How the source was accessed during research for this project. */
  access: 'full text' | 'abstract' | 'bibliographic record' | 'standard reference, not re-read';
}

export const REFERENCES: Reference[] = [
  {
    id: 'norman2001',
    authors: 'Norman MD, Finn J, Tregenza T',
    year: 2001,
    title: 'Dynamic mimicry in an Indo-Malayan octopus',
    source: 'Proceedings of the Royal Society B 268(1478): 1755–1758',
    url: 'https://doi.org/10.1098/rspb.2001.1708',
    kind: 'peer-reviewed',
    access: 'full text',
  },
  {
    id: 'norman2005',
    authors: 'Norman MD, Hochberg FG',
    year: 2005,
    title: 'The "Mimic Octopus" (Thaumoctopus mimicus n. gen. et sp.), a new octopus from the tropical Indo-West Pacific (Cephalopoda: Octopodidae)',
    source: 'Molluscan Research 25(2): 57–70',
    url: 'https://doi.org/10.11646/mr.25.2.1',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'hanlon2008',
    authors: 'Hanlon RT, Conroy L-A, Forsythe JW',
    year: 2008,
    title: 'Mimicry and foraging behaviour of two tropical sand-flat octopus species off North Sulawesi, Indonesia',
    source: 'Biological Journal of the Linnean Society 93(1): 23–38',
    url: 'https://doi.org/10.1111/j.1095-8312.2007.00948.x',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'huffard2010',
    authors: 'Huffard CL, Saarman N, Hamilton H, Simison WB',
    year: 2010,
    title: 'The evolution of conspicuous facultative mimicry in octopuses: an example of secondary adaptation?',
    source: 'Biological Journal of the Linnean Society 101(1): 68–77',
    url: 'https://doi.org/10.1111/j.1095-8312.2010.01484.x',
    kind: 'peer-reviewed',
    access: 'full text',
  },
  {
    id: 'amnh',
    authors: 'American Museum of Natural History',
    year: 'n.d.',
    title: 'The Talented Mimic Octopus',
    source: 'AMNH news and blogs',
    url: 'https://www.amnh.org/explore/news-blogs/mimic-octopus-behavior',
    kind: 'museum',
    access: 'full text',
  },
  {
    id: 'sajikumar2020',
    authors: 'Sajikumar KK, Jeyabaskaran R, Binesh CP, Mohamed KS',
    year: 2020,
    title: 'First record of the mimic octopus Thaumoctopus mimicus (Cephalopoda: Octopodidae) from the Arabian Sea: range extension and genotyping',
    source: 'Malacologia 63(1): 115–122',
    url: 'https://doi.org/10.4002/040.063.0111',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'hochberg2006',
    authors: 'Hochberg FG, Norman MD, Finn J',
    year: 2006,
    title: 'Wunderpus photogenicus n. gen. and sp., a new octopus from the shallow waters of the Indo-Malayan Archipelago (Cephalopoda: Octopodidae)',
    source: 'Molluscan Research 26(3)',
    url: 'https://doi.org/10.11646/mr.26.3.5',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'young1963',
    authors: 'Young JZ',
    year: 1963,
    title: 'The number and sizes of nerve cells in Octopus',
    source: 'Proceedings of the Zoological Society of London 140(2): 229–254',
    url: 'https://doi.org/10.1111/j.1469-7998.1963.tb01862.x',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'young1971',
    authors: 'Young JZ',
    year: 1971,
    title: 'The Anatomy of the Nervous System of Octopus vulgaris',
    source: 'Clarendon Press, Oxford',
    kind: 'book',
    access: 'standard reference, not re-read',
  },
  {
    id: 'sumbre2001',
    authors: 'Sumbre G, Gutfreund Y, Fiorito G, Flash T, Hochner B',
    year: 2001,
    title: 'Control of octopus arm extension by a peripheral motor program',
    source: 'Science 293(5536): 1845–1848',
    url: 'https://doi.org/10.1126/science.1060976',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'zullo2009',
    authors: 'Zullo L, Sumbre G, Agnisola C, Flash T, Hochner B',
    year: 2009,
    title: 'Nonsomatotopic organization of the higher motor centers in octopus',
    source: 'Current Biology 19(19): 1632–1636',
    url: 'https://doi.org/10.1016/j.cub.2009.07.067',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'gutnick2011',
    authors: 'Gutnick T, Byrne RA, Hochner B, Kuba M',
    year: 2011,
    title: 'Octopus vulgaris uses visual information to determine the location of its arm',
    source: 'Current Biology 21(6): 460–462',
    url: 'https://doi.org/10.1016/j.cub.2011.01.052',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'gutnick2020',
    authors: 'Gutnick T, Zullo L, Hochner B, Kuba MJ',
    year: 2020,
    title: 'Use of peripheral sensory information for central nervous control of arm movement by Octopus vulgaris',
    source: 'Current Biology 30(21): 4322–4327',
    url: 'https://doi.org/10.1016/j.cub.2020.08.037',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'hochner2012',
    authors: 'Hochner B',
    year: 2012,
    title: 'An embodied view of octopus neurobiology',
    source: 'Current Biology 22(20): R887–R892',
    url: 'https://doi.org/10.1016/j.cub.2012.09.001',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'kier1985',
    authors: 'Kier WM, Smith KK',
    year: 1985,
    title: 'Tongues, tentacles and trunks: the biomechanics of movement in muscular-hydrostats',
    source: 'Zoological Journal of the Linnean Society 83(4): 307–324',
    url: 'https://doi.org/10.1111/j.1096-3642.1985.tb01178.x',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
  {
    id: 'kier2007',
    authors: 'Kier WM, Stella MP',
    year: 2007,
    title: 'The arrangement and function of octopus arm musculature and connective tissue',
    source: 'Journal of Morphology 268(10): 831–843',
    url: 'https://doi.org/10.1002/jmor.10548',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'kier2002',
    authors: 'Kier WM, Smith AM',
    year: 2002,
    title: 'The structure and adhesive mechanism of octopus suckers',
    source: 'Integrative and Comparative Biology 42(6): 1146–1153',
    url: 'https://doi.org/10.1093/icb/42.6.1146',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'vangiesen2020',
    authors: 'van Giesen L, Kilian PB, Allard CAH, Bellono NW',
    year: 2020,
    title: 'Molecular basis of chemotactile sensation in octopus',
    source: 'Cell 183(3): 594–604',
    url: 'https://doi.org/10.1016/j.cell.2020.09.008',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
  {
    id: 'wells1987',
    authors: 'Wells MJ, Smith PJS',
    year: 1987,
    title: 'The performance of the octopus circulatory system: a triumph of engineering over design',
    source: 'Experientia 43(5): 487–499',
    url: 'https://doi.org/10.1007/BF02143577',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
  {
    id: 'wells1978',
    authors: 'Wells MJ',
    year: 1978,
    title: 'Octopus: Physiology and Behaviour of an Advanced Invertebrate',
    source: 'Chapman & Hall, London',
    kind: 'book',
    access: 'standard reference, not re-read',
  },
  {
    id: 'hanlon2018',
    authors: 'Hanlon RT, Messenger JB',
    year: 2018,
    title: 'Cephalopod Behaviour, 2nd edition',
    source: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/9780511843600',
    kind: 'book',
    access: 'standard reference, not re-read',
  },
  {
    id: 'messenger2001',
    authors: 'Messenger JB',
    year: 2001,
    title: 'Cephalopod chromatophores: neurobiology and natural history',
    source: 'Biological Reviews 76(4): 473–528',
    url: 'https://doi.org/10.1017/S1464793101005772',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'froesch1978',
    authors: 'Froesch D, Messenger JB',
    year: 1978,
    title: 'On leucophores and the chromatic unit of Octopus vulgaris',
    source: 'Journal of Zoology 186(2): 163–173',
    url: 'https://doi.org/10.1111/j.1469-7998.1978.tb03363.x',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'mathger2009',
    authors: 'Mäthger LM, Denton EJ, Marshall NJ, Hanlon RT',
    year: 2009,
    title: 'Mechanisms and behavioural functions of structural coloration in cephalopods',
    source: 'Journal of the Royal Society Interface 6 (suppl. 2)',
    url: 'https://doi.org/10.1098/rsif.2008.0366.focus',
    kind: 'peer-reviewed',
    access: 'abstract',
  },
  {
    id: 'allen2014',
    authors: 'Allen JJ, Bell GRR, Kuzirian AM, Velankar SS, Hanlon RT',
    year: 2014,
    title: 'Comparative morphology of changeable skin papillae in octopus and cuttlefish',
    source: 'Journal of Morphology 275(4): 371–390',
    url: 'https://doi.org/10.1002/jmor.20221',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
  {
    id: 'messenger1977',
    authors: 'Messenger JB',
    year: 1977,
    title: 'Evidence that Octopus is colour blind',
    source: 'Journal of Experimental Biology 70(1): 49–55',
    url: 'https://doi.org/10.1242/jeb.70.1.49',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
  {
    id: 'xu2025',
    authors: 'Xu C',
    year: 2025,
    title: "From nature's masters of camouflage to engineered optics: cephalopod-inspired materials and technologies",
    source: 'Journal of Materials Chemistry C 13(42): 21275–21301',
    url: 'https://doi.org/10.1039/D5TC02185E',
    kind: 'peer-reviewed',
    access: 'bibliographic record',
  },
];

const BY_ID = new Map(REFERENCES.map((r) => [r.id, r]));

export function getReference(id: string): Reference | undefined {
  return BY_ID.get(id);
}

export function hasReference(id: string): boolean {
  return BY_ID.has(id);
}

/** Short in-text form, e.g. "Norman et al. 2001". */
export function shortCitation(id: string): string {
  const r = BY_ID.get(id);
  if (!r) return id;
  const names = r.authors.split(',').map((s) => s.trim().replace(/\s+[A-Z-]+$/, ''));
  const lead = names.length > 2 ? `${names[0]} et al.` : names.join(' & ');
  return `${lead} ${r.year}`;
}

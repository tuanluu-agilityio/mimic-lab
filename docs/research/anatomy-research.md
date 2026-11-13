# Anatomy research: mimic octopus (*Thaumoctopus mimicus*)

Compiled 2026-11-13 for the 3D anatomy viewer.

## How to read this file

Every statement carries one of these evidence tags.

| Tag | Meaning |
|---|---|
| **[Tm-primary]** | Documented for *T. mimicus* itself in a peer-reviewed source whose full text or abstract I read. |
| **[Tm-secondary]** | Stated for *T. mimicus* by a secondary source (web page, search-result snippet, other paper citing the description). Not checked against the original. |
| **[General]** | Known from other octopuses (species named where possible). **Not** documented for *T. mimicus*. |
| **[Background]** | Standard textbook octopod anatomy. I did not re-read a source for it in this session; the works listed are the standard places to confirm it. |
| **[Unverified]** | I could not confirm it. Do not present as fact. |

**Main limitation.** I could not obtain the full text of the species description (Norman & Hochberg 2005). The publisher PDF is paywalled, the Plazi treatment is a stub, and the FAO catalogue (Norman, Finn & Hochberg 2014) refused automated access. I read only the abstract of the description. Every measurement below that is not in that abstract is therefore secondary or unverified. Someone with library access should check the description before the site publishes numbers as "from the species description".

---

## 1. External morphology of *T. mimicus*

### 1.1 What the species description abstract states [Tm-primary, abstract only]

Norman & Hochberg (2005) erect the genus on this combination of characters:

- no calamus on the male copulatory organ;
- no enlarged suckers in either sex;
- long, narrow arms capable of autotomy (shedding) at a set level near the base;
- colour-pattern base components including a **white teardrop ring on the mid-dorsal mantle** and a **distinct white "U" patch on the posterio-dorsal mantle**.

Other facts in the abstract: shallow water, 0.5–37 m, on soft sediment; day-active; forages for small fish and crustaceans; distribution from New Caledonia to Indonesia, Malaysia and the Philippines, with photographic records from the Red Sea.

Note: one automated summary of the older publisher page gave the depth as "0.5–7 m". The Crossref-deposited abstract says 0.5–37 m. Use 0.5–37 m.

### 1.2 Size and proportions

| Feature | Value | Tag | Source |
|---|---|---|---|
| Arm span | up to 60 cm (a "large female" had a 60 cm arm span) | [Tm-primary] | Norman, Finn & Tregenza 2001, full text |
| Dorsal mantle length of two collected specimens | 44 mm and 48 mm | [Tm-primary, abstract] | Sajikumar et al. 2020 (Arabian Sea record) |
| Mantle length "to 58 mm" (some pages say about 60 mm) | widely repeated | [Tm-secondary] | Web pages attribute it to the description; I could not check |
| Mantle length 40–60 mm in Andaman Sea material | | [Tm-secondary] | Search-result snippet of Nabhitabhata & Mitrpanont; paper not read |
| Total length "about 48 cm" / "about 60 cm" | | [Tm-secondary] | Popular pages, unsourced |
| Arms classed as "very long" (the authors' threshold is 6.5 times mantle length or more) | | [Tm-primary] | Huffard et al. 2010, full text. The paper defines the threshold and places *T. mimicus* in the "Long-Armed Sand Octopus" clade characterised by extremely long arms. The per-species value is in Table S2, which I did not see. |
| Arms "7–10 times mantle length" (another page: "5–10 times") | | [Tm-secondary] | Unsourced web pages |
| Arm formula | not found | [Unverified] | Would be in the description |
| Arm thickness "about pencil width at the widest point" | | [Tm-secondary] | Wikipedia, unsourced |

**Consistency check for modelling.** A 60 cm arm span with a mantle of about 45–58 mm implies arms of roughly 28–30 cm, or about 5–6.5 times mantle length. The published threshold (6.5 times or more) and the popular "7–10 times" are higher. These figures do not all agree, probably because arm span, arm length and total length are measured differently and on different animals. A defensible model proportion is **arms about 6–7 times mantle length**, stated on the site as approximate.

**A figure to ignore.** One search result returned "28.2–31.0 mm mantle length, arms 3.4–4.6 times mantle length". That text describes a small, robust, medium-armed species and comes from a different paper shown alongside the description on an aggregator page. It is not *T. mimicus*.

### 1.3 Arms and suckers

- **Sucker rows: two (biserial).** [Tm-secondary] Stated in a search-result snippet of the Andaman Sea record ("arm suckers were biserial") and on a fan-club page ("2 rows of up to 283 suckers"). I could not read either original. Two rows is also the normal condition in Octopodidae in the strict sense, the family the species belongs to [Background].
- **Sucker count up to 283 on normal arms.** [Tm-secondary] Unsourced web pages; likely from the description but unchecked.
- **No enlarged suckers in either sex.** [Tm-primary, abstract]
- **Arm autotomy at a set level near the base.** [Tm-primary, abstract] The arms can be shed at a fixed plane close to the body.

### 1.4 Colour and banding

- Foraging animals crawl "in drab brown colours". [Tm-primary] Norman et al. 2001.
- A high-contrast dark brown and light cream (white) pattern, including distinct arm bands, is shown during flatfish swimming and other displays, and can also be visible at rest. [Tm-primary] Huffard et al. 2010.
- The pattern is under neural control and is not anatomically fixed; the same animal can be camouflaged or conspicuous. [Tm-primary] Huffard et al. 2010; Hanlon et al. 2008 (abstract).
- White teardrop ring on mid-dorsal mantle; white "U" on posterior dorsal mantle. [Tm-primary, abstract] Norman & Hochberg 2005.
- "Regular white bands on the arms against a dark brown base colour". [Tm-secondary] Fan-club page, unsourced; consistent with the primary sources above.

See `skin-and-camouflage.md` for detail and for the comparison with *Wunderpus photogenicus*.

### 1.5 Eyes and ocular papillae

- "Paired, sharply pointed, elongate papillae over each eye" and "a rim of papillae around the mantle". [Tm-secondary] Fan-club page, unsourced. Photographs of the species show a raised papilla above each eye, but I have no primary text for the wording.
- Horizontal slit pupil. [Background] Typical of octopuses; not checked for this species.
- For contrast, *Wunderpus photogenicus* has small eyes on elongate stalks with a long conical papilla over each eye. [Primary, abstract] Hochberg, Norman & Finn 2006.

### 1.6 Web

- The web is used in feeding: foraging animals use "the flared webs to trap fleeing prey". [Tm-primary] Norman et al. 2001.
- Web depth as a proportion of arm length: not found. [Unverified] In long-armed octopuses the web is shallow relative to arm length [Background]. Model a shallow web and label the depth as schematic.
- A search snippet claimed the description says the web is "minimally flared". [Tm-secondary] Unchecked, and in tension with Norman et al. 2001. Do not use.

### 1.7 Funnel

No species-specific description found. [Unverified] Use the general octopod funnel (section 2.8) and label it as generalised.

### 1.8 Ink sac: is one present?

**Status: not confirmed from a primary source. No source found says it is absent.**

What I can establish:

1. The description's abstract lists the characters that define the genus (section 1.1). Loss of the ink sac is not among them. [Tm-primary, abstract]
2. The same first author described *Ameloctopus litoralis* (Norman 1992), a shallow-water octopus whose headline diagnostic character is "the absence of an ink sac". Its abstract ends with the sentence "Loss of the ink sac in a shallow-water octopod and the development of arm autotomy are discussed." [Primary, abstract] So where a shallow-water species lacks an ink sac, this author treats it as a leading diagnostic character. Its absence from the *Thaumoctopus* diagnosis is indirect evidence that an ink sac is present. This is an inference, not a statement from the description.
3. An aquarist account (C. Shaw, in Caldwell & Shaw, The Cephalopod Page) says captive mimics "seem to ink out of frustration". [Tm-secondary, not peer reviewed]
4. An ink sac is the normal condition in shallow-water, light-dwelling octopods [Background].

**Warning about a misattribution.** Web search summaries twice attributed the sentence "Loss of the ink sac in a shallow-water octopod and the development of arm autotomy are discussed" to the *T. mimicus* description. It is not in that abstract. It belongs to the *Ameloctopus litoralis* paper, which appears next to the description on aggregator pages. *T. mimicus* shares arm autotomy with *Ameloctopus*, which makes the mix-up easy.

**Recommendation.** Show an ink sac. Label it "generalised from other shallow-water octopuses; presence in *T. mimicus* is expected but we have not confirmed it against the species description". Remove the caveat only after someone reads the description (or the FAO catalogue entry).

---

## 2. Internal anatomy of octopods

Everything in this section is **[General]** or **[Background]**. None of it has been published for *T. mimicus*. Positions and sizes are schematic guidance for a model, not measurements.

Orientation used below: the arms and mouth are "anterior/oral"; the tip of the mantle sac is "posterior"; the funnel side is "ventral"; the eye-and-back side is "dorsal".

### 2.1 Brain and cranium

- The central brain sits in the head between the eyes, enclosed in a cartilaginous cranium. [Background; Young 1971]
- It is a ring of fused ganglia around the oesophagus: a **supraoesophageal mass** above the gut and a **suboesophageal mass** below it, joined at the sides. The oesophagus passes through the middle of the brain. [Background; Young 1971; Budelmann 1995]
- Functionally, the supraoesophageal mass holds the higher centres (including the vertical and frontal lobes used in learning, and the basal lobes used as higher motor centres); the suboesophageal mass holds lower motor centres, including brachial lobes for the arms, pedal lobes, and the chromatophore lobes that drive skin colour. [Background; Young 1971; Messenger 2001 abstract for the chromatophore hierarchy]
- The statocysts (balance organs) are embedded in the cranial cartilage. [General, *O. vulgaris*; Levy & Hochner 2017]
- Model guidance: a compact lobed mass roughly the size of one eyeball or smaller, centred between the eyes, with the oesophagus as a thin tube through it.

### 2.2 Optic lobes

- One large optic lobe lies behind each eye, outside the cranium proper, joined to the central brain by an optic tract. [Background; Young 1971]
- Together the two optic lobes hold more neurons than the central brain (section 3). [General, *O. vulgaris*]
- Model guidance: bean-shaped, each comparable in volume to the whole central brain, immediately medial to the back of each eye.

### 2.3 Arm nerve cords and the nerve ring

- Each arm has an **axial nerve cord** running down its centre, surrounded by the arm muscle. [General; Kier & Stella 2007 abstract, *O. bimaculoides*]
- In cross-section the cord has a cell-body layer wrapped in a horseshoe around a central neuropil on the sucker (oral) side, and a large **cerebro-brachial tract** on the far (aboral) side carrying fibres to and from the brain. [General, *O. bimaculoides*; Olson et al. 2025, full text read via summary]
- The cord swells over each sucker, and each sucker also has its own small **sucker ganglion**. Four smaller **intramuscular nerve cords** run in the arm muscle around the axial cord. [General, *O. bimaculoides*; Olson et al. 2025]
- The cell bodies in the axial cord are arranged in repeated segments separated by septa, and each sucker's nerves map in order onto the cord. [General, *O. bimaculoides*; Olson et al. 2025]
- At the arm bases, the eight axial cords are linked to each other by a ring of connecting fibres, the **interbrachial commissure**, so neighbouring arms are connected without going through the brain. [Background; Young 1971]
- Model guidance: a cord about one fifth to one quarter of arm diameter, centred slightly toward the sucker side, with a bead-like swelling at each sucker; a ring joining the eight cords around the mouth just beyond the buccal mass.

### 2.4 Stellate ganglia

- A pair of star-shaped ganglia on the inner wall of the mantle, one on each side toward the dorsal-anterior part of the mantle cavity. Each receives a pallial nerve from the brain and sends radiating nerves into the mantle muscle. They drive the mantle contractions used for breathing and jetting. [Background; Young 1971]
- Model guidance: a small star on each inner side wall of the mantle, about level with the gill bases or a little forward.

### 2.5 Gills

- Octopuses have **two gills** (one pair), one on each side of the mantle cavity, hanging beside the visceral mass. [Background; Wells 1978]
- Water is drawn in around the mantle edge, passes over the gills and leaves through the funnel. [Background]
- Gill lamellae count for *T. mimicus*: not found. [Unverified]

### 2.6 Hearts and blood

- **Three hearts.** One median **systemic heart** receives oxygenated blood from the gills and pumps it to the body. Two **branchial hearts**, one at the base of each gill, pump deoxygenated blood through the gills. [Background; Wells & Smith 1987, title and standard account]
- The blood pigment is **haemocyanin**, a copper-based protein dissolved in the plasma rather than carried in cells. It is blue when oxygenated and nearly colourless when not. [Background; Wells 1978]
- Model guidance: systemic heart on the midline of the visceral mass between the gill bases; a small rounded branchial heart at the root of each gill.

### 2.7 Digestive tract (in order)

All [Background; Wells 1978; Hanlon & Messenger 2018] unless noted.

1. **Buccal mass**: muscular bulb at the centre of the arm crown containing the **beak** (two chitinous jaws like an inverted parrot beak) and the **radula** (toothed rasping ribbon).
2. **Salivary glands**: small anterior glands on the buccal mass; large paired **posterior salivary glands** lying behind the brain at the front of the visceral mass, with a duct running forward through the brain to the mouth. They secrete enzymes and, in many species, toxins used to subdue prey.
3. **Oesophagus**: narrow tube running back through the brain.
4. **Crop**: a side pouch of the oesophagus for storing food.
5. **Stomach**: muscular, for mechanical breakdown.
6. **Caecum**: spiral-coiled sac next to the stomach, for sorting and absorption.
7. **Digestive gland**: the largest organ in the visceral mass, a brown ovoid body that secretes enzymes and absorbs nutrients.
8. **Intestine**: loops forward from the stomach and caecum.
9. **Anus**: opens into the mantle cavity near the base of the funnel, so wastes leave with the exhaled water.

Toxicity of *T. mimicus* is unknown; Huffard et al. 2010 say so explicitly and note it "may be unpalatable". [Tm-primary]

### 2.8 Ink sac and funnel

- **Ink sac** [Background]: in octopods a small pear-shaped sac on the ventral surface of the digestive gland, partly embedded in it. Its duct joins the rectum close to the anus, so ink is expelled through the funnel. Ink is a melanin suspension with mucus. For presence in *T. mimicus* see section 1.8.
- **Funnel (siphon)** [Background]: a muscular tube on the ventral side of the head, opening out of the mantle cavity. It carries exhaled water, wastes, ink and, in females, eggs. It can be pointed in different directions to steer the jet (see `locomotion-research.md`).

### 2.9 Kidneys and gonad

- Paired **renal sacs** (kidneys) lie around the veins leading to the branchial hearts and open into the mantle cavity. [Background]
- A **single gonad** (ovary or testis) sits at the posterior end of the visceral mass, near the tip of the mantle. In males the third right arm is modified as a hectocotylus for passing spermatophores. [Background] In *T. mimicus* the copulatory organ lacks a calamus. [Tm-primary, abstract]

### 2.10 Schematic layout for the mantle (model guidance, not measured)

From front (mantle opening) to back (mantle tip), inside the mantle sac:

- funnel on the ventral side at the opening; anus and ink duct opening just inside it;
- posterior salivary glands and crop at the front of the visceral mass, just behind the head;
- digestive gland filling the central dorsal part, with the ink sac on its ventral face;
- stomach and caecum behind the digestive gland;
- systemic heart on the midline ventrally, branchial hearts at the gill bases, kidneys around them;
- gills on left and right in the cavity between visceral mass and mantle wall;
- stellate ganglia on the inner mantle wall, left and right;
- gonad at the posterior tip.

---

## 3. Nervous system numbers

**All counts are for *Octopus vulgaris*. No neuron counts exist for *T. mimicus*.** The numbers trace back to J. Z. Young's histological estimates from the 1960s to 1980s, and the regional figures vary between his own publications and later reviews.

| Quantity | Figure | Species | Source and how I read it |
|---|---|---|---|
| Total nerve cells | about 500 million | *O. vulgaris* | Young 1963, abstract read |
| In the arm ganglia | about 300 million | *O. vulgaris* | Young 1963, abstract read |
| In the arms | 350 million | *O. vulgaris* | Young 1988 ("Octopus Brain"), abstract read |
| Optic lobes (both) | 92 million | *O. vulgaris* | Young 1988, abstract read |
| Central brain | 42 million | *O. vulgaris* | Young 1988, abstract read |
| Optic lobes (both) | 120–180 million | *O. vulgaris* | Carls-Diamante 2022 (review, full text read via summary); gives no citation for this figure |
| Central brain | 45–50 million | *O. vulgaris* | Carls-Diamante 2022; no citation given |
| Share in the central nervous system | "only one third of the neurons" | *O. vulgaris* | Gutnick et al. 2020, abstract read |
| Arms versus brain | more neurons across the eight arms than in the brain | octopus generally, citing Young 1963 and 1971 | Olson et al. 2025, full text read via summary |
| Nerve fibres linking brain and arm system | "only about 30,000" | *O. vulgaris* | Carls-Diamante 2022, attributing it to Hochner 2012 p. R889. I could not open Hochner 2012 to check the number or exactly what it counts. Treat as [Unverified]. |

**Recommended site wording for the counts:** "About 500 million neurons in total in the common octopus (*Octopus vulgaris*), of which roughly 300–350 million, about two thirds, are in the arm nerve cords. The optic lobes hold on the order of 100–180 million and the central brain about 40–50 million. These are estimates from one species made decades ago; no count exists for the mimic octopus."

Two cautions:

- The regional figures do not add up exactly to 500 million in any single source I read. Present them as approximate.
- The often-quoted comparison with a dog's neuron count is not in any source I read. Leave it out.

### 3.1 How much do the arms do locally?

Evidence, all from *Octopus vulgaris*:

- **Local motor programs exist.** Arm extensions can be evoked by mechanical or electrical stimulation in arms whose connection to the brain has been cut, and they have nearly the same kinematics as natural reaches. The authors conclude that the basic motor program for this movement is embedded in the arm's own circuitry. (Sumbre et al. 2001, abstract read.)
- **Local reflexes persist in isolated arms.** Sucker grasping continued for hours in amputated arms. (Rowell 1963, as reported by Carls-Diamante 2022; original not read.)
- **The brain has no arm-by-arm map in its higher motor centres.** Microstimulation of the basal lobes produced whole movements built from shared components; no site moved a single arm or body part. (Zullo et al. 2009, abstract read.)
- **The brain nevertheless directs single arms.** Octopuses learned to guide one arm through a maze to a visually marked target, showing that central visual information is combined with information about where the arm is. (Gutnick et al. 2011, abstract read.)
- **The brain uses information coming up from the arm.** In single-arm mazes octopuses learned tasks that required the central nervous system to use touch and movement information from that arm. The authors' own summary: "although octopus arms have a great capacity to act independently, they are also subject to central control, allowing well-organized, purposeful behavior of the organism as a whole." (Gutnick et al. 2020, abstract read.)
- **Division of labour as described in reviews.** The brain selects, starts and scales movements with a small number of control variables; the arm's neuromuscular system fills in the detail. (Levy & Hochner 2017, full text read via summary; Hochner 2012, abstract read.)

### 3.2 Wording to replace "each arm has its own brain"

Recommended (short):

> Each arm contains a large nerve cord with its own local circuits. In the common octopus these circuits can produce basic movements, such as reaching and sucker grasping, without moment-to-moment instructions from the brain. The brain still decides when and where to move, and experiments show it can guide a single arm using vision and can use touch information coming back from that arm. The arms are semi-independent, not separate brains.

Recommended (one line for a label):

> About two thirds of an octopus's neurons lie in its arm nerve cords, which handle much of the detail of arm movement locally under overall control from the brain.

Add the footnote: "Based on experiments with *Octopus vulgaris*; not studied in the mimic octopus."

Avoid: "nine brains", "each arm thinks for itself", "the arms are not controlled by the brain", and any claim about arms being separately conscious. The last is discussed in the philosophical literature as speculation (Carls-Diamante 2022 calls its own proposal "largely (and admittedly) speculative").

---

## 4. Arm musculature and suckers

All **[General]**. Species named per item.

### 4.1 Muscular hydrostat

- An octopus arm has no skeleton. It is a **muscular hydrostat**: a densely packed block of muscle that stays at essentially constant volume, so shortening in one dimension forces lengthening in another. The muscle is both the motor and the support. (Kier & Smith 1985, title verified, standard account; Kier 2016, full text read via summary.)

### 4.2 Muscle fibre orientations (*Octopus bimaculoides*, *O. briareus*, *O. digueti*)

From Kier & Stella 2007 (abstract read) and Kier 2016:

- **Transverse muscle**: fibres in planes perpendicular to the arm's long axis, surrounding the axial nerve cord. Contracting it thins the arm, so the arm **elongates**.
- **Longitudinal muscle**: fibres parallel to the long axis, in bundles around the periphery. Contracting it **shortens** the arm; contracting it on one side **bends** the arm, with the transverse muscle resisting compression.
- **Oblique muscle**: three layers on each side (external, median, internal) with fibres wound in helices. Contracting them **twists** the arm (torsion).
- A thin **circular muscle** layer wraps the arm on the aboral side.
- Co-contraction of transverse and longitudinal muscle **stiffens** the arm.
- Transverse fibres pass through the longitudinal bundles in sheets called trabeculae; crossed-fibre connective tissue sheets on the oral and aboral sides anchor the muscles.
- The proportions of each muscle group stay constant along the arm even though the arm tapers.

All eight arms can bend, twist, lengthen and shorten at any point along their length (*O. bimaculoides*; Kennedy et al. 2020, abstract read).

Model guidance for a cross-section, from centre outward: axial nerve cord; transverse muscle; longitudinal bundles; oblique layers; skin. Suckers attach on the oral side through their own connecting muscles.

### 4.3 Sucker structure

- Two chambers: the **infundibulum**, the exposed disc-like face that contacts the surface, and the **acetabulum**, the hollow cup above it, joined by a narrow orifice. (Kier & Smith 2002, abstract read; Tramacere et al. 2013, *O. vulgaris*, full text read via summary.)
- The sucker wall is itself a three-dimensional muscle block with **radial**, **circular** and **meridional** fibres, plus connective tissue layers. (Kier & Smith 2002.)
- The infundibulum is lined by a chitinous cuticle with radial grooves and tiny denticles, which is shed and renewed, and is ringed by a soft folded rim that makes the seal. (Tramacere et al. 2013.)

### 4.4 How adhesion works

- The rim seals to the surface. Radial muscles then contract and thin the sucker wall, which would enlarge the enclosed volume. Because the trapped water resists expansion, the pressure inside drops instead, and the higher outside pressure holds the sucker on. Circular and meridional muscles oppose the radial muscles. Elastic connective tissue may store energy so that grip can be held cheaply. (Kier & Smith 2002, abstract read.)
- Suckers can pull the internal pressure below 0 kPa on wettable surfaces; the limit is cavitation of the water. (Kier & Smith 2002.)
- A refinement proposed for *O. vulgaris*: a protuberance on the acetabular roof may plug the orifice and help hold suction with little muscle effort. The authors present this as a hypothesis. (Tramacere et al. 2013.)

### 4.5 Chemotactile sensing ("taste by touch")

- Sucker rims carry dense sensory innervation (Graziadei & Gagne 1976, title verified; not read).
- In *Octopus bimaculoides*, sucker sensory cells carry chemotactile receptors that detect poorly soluble molecules on contact, alongside mechanoreceptors, so the animal can assess a surface chemically by touching it. (van Giesen et al. 2020, title verified; findings from my background knowledge of the paper, not re-read this session.)
- This fits the foraging style of *T. mimicus*, which probes holes with its arm tips (Norman et al. 2001), but the sensory biology itself has not been studied in *T. mimicus*.

---

## 5. Where the site must say "generalised from other octopus species"

- Every internal organ: brain, optic lobes, nerve cords, stellate ganglia, gills, hearts, digestive tract, ink sac, kidneys, gonad.
- All neuron counts (*Octopus vulgaris*).
- All statements about arm neural control (*O. vulgaris*).
- Arm muscle architecture (*O. bimaculoides* and relatives) and sucker mechanics (*O. vulgaris* and other *Octopus* species).
- Chemotactile sensing (*O. bimaculoides*).
- Funnel anatomy, web depth, gill lamellae count.
- Ink sac presence (expected, unconfirmed).

Species-specific content the site can state for *T. mimicus*: arm span to 60 cm; mantle about 45–58 mm; very long, narrow arms that can be shed near the base; no enlarged suckers; the white teardrop ring and white "U" mantle marks; brown and white banding that the animal can turn up or down; day-active on shallow soft sediment; burrow use and hole-probing foraging.

---

## References

Reading level is given for each: **full text**, **abstract**, **summary** (full text fetched and summarised by a tool, not read line by line by me), **title only** (bibliographic details verified via Crossref or PubMed; content from background knowledge), or **secondary**.

1. Norman MD, Hochberg FG (2005). The "Mimic Octopus" (*Thaumoctopus mimicus* n. gen. et sp.), a new octopus from the tropical Indo-West Pacific (Cephalopoda: Octopodidae). *Molluscan Research* 25(2): 57–70. https://doi.org/10.11646/mr.25.2.1 — **abstract** (Crossref deposit and publisher page). Full text not accessible.
2. Norman MD, Finn J, Tregenza T (2001). Dynamic mimicry in an Indo-Malayan octopus. *Proceedings of the Royal Society B* 268(1478): 1755–1758. https://doi.org/10.1098/rspb.2001.1708 (PMC1088805) — **full text**.
3. Huffard CL, Saarman N, Hamilton H, Simison WB (2010). The evolution of conspicuous facultative mimicry in octopuses: an example of secondary adaptation? *Biological Journal of the Linnean Society* 101(1): 68–77. https://doi.org/10.1111/j.1095-8312.2010.01484.x — **full text** (main paper; supplementary tables not seen). DOI verified in Crossref.
4. Hanlon RT, Conroy L-A, Forsythe JW (2008). Mimicry and foraging behaviour of two tropical sand-flat octopus species off North Sulawesi, Indonesia. *Biological Journal of the Linnean Society* 93(1): 23–38. https://doi.org/10.1111/j.1095-8312.2007.00948.x — **abstract**.
5. Sajikumar KK, Jeyabaskaran R, Binesh CP, Mohamed KS (2020). First record of the mimic octopus *Thaumoctopus mimicus* (Cephalopoda: Octopodidae) from the Arabian Sea: range extension and genotyping. *Malacologia* 63(1): 115–122. https://doi.org/10.4002/040.063.0111 — **abstract**.
6. Hochberg FG, Norman MD, Finn J (2006). *Wunderpus photogenicus* n. gen. and sp., a new octopus from the shallow waters of the Indo-Malayan Archipelago (Cephalopoda: Octopodidae). *Molluscan Research* 26(3): 128–140. https://doi.org/10.11646/mr.26.3.5 — **abstract**. The page range is from my memory; Crossref lists none, so confirm it before citing.
7. Norman MD (1992). *Ameloctopus litoralis*, gen. et sp. nov. (Cephalopoda: Octopodidae), a new shallow-water octopus from tropical Australian waters. *Invertebrate Taxonomy* 6(3): 567–582. https://doi.org/10.1071/IT9920567 — **abstract**. Cited only to explain the ink-sac misattribution.
8. Strugnell J, Norman M, Vecchione M, Guzik M, Allcock AL (2014). The ink sac clouds octopod evolutionary history. *Hydrobiologia* 725(1): 215–235. https://doi.org/10.1007/s10750-013-1517-6 — **title only**. Likely to contain an ink-sac presence/absence figure covering *Thaumoctopus*; worth checking.
9. Norman MD, Finn JK, Hochberg FG (2014). Family Octopodidae. In: Jereb P, Roper CFE, Norman MD, Finn JK (eds), *Cephalopods of the World*, vol. 3, Octopods and Vampire Squids. FAO Species Catalogue for Fishery Purposes No. 4, vol. 3. FAO, Rome. — **not accessed** (server refused). Best open source for a verified species diagnosis.
10. Caldwell R, Shaw CD, Wood JB. Mimic octopuses: will we love them to death? The Cephalopod Page. https://www.thecephalopodpage.org/mimic.php — **summary**; not peer reviewed.
11. Young JZ (1963). The number and sizes of nerve cells in *Octopus*. *Proceedings of the Zoological Society of London* 140(2): 229–254. https://doi.org/10.1111/j.1469-7998.1963.tb01862.x — **abstract**.
12. Young JZ (1988). Octopus brain. In: *Comparative Neuroscience and Neurobiology* (Readings from the Encyclopedia of Neuroscience), pp. 97–99. Birkhäuser. https://doi.org/10.1007/978-1-4899-6776-3_39 — **abstract**.
13. Young JZ (1971). *The Anatomy of the Nervous System of* Octopus vulgaris. Clarendon Press, Oxford. — **not read**; standard reference, cited for background anatomy.
14. Sumbre G, Gutfreund Y, Fiorito G, Flash T, Hochner B (2001). Control of octopus arm extension by a peripheral motor program. *Science* 293(5536): 1845–1848. https://doi.org/10.1126/science.1060976 — **abstract** (PubMed).
15. Gutnick T, Byrne RA, Hochner B, Kuba M (2011). *Octopus vulgaris* uses visual information to determine the location of its arm. *Current Biology* 21(6): 460–462. https://doi.org/10.1016/j.cub.2011.01.052 — **abstract** (PubMed).
16. Gutnick T, Zullo L, Hochner B, Kuba MJ (2020). Use of peripheral sensory information for central nervous control of arm movement by *Octopus vulgaris*. *Current Biology* 30(21): 4322–4327.e3. https://doi.org/10.1016/j.cub.2020.08.037 — **abstract** (PubMed).
17. Zullo L, Sumbre G, Agnisola C, Flash T, Hochner B (2009). Nonsomatotopic organization of the higher motor centers in octopus. *Current Biology* 19(19): 1632–1636. https://doi.org/10.1016/j.cub.2009.07.067 — **abstract** (PubMed).
18. Hochner B (2012). An embodied view of octopus neurobiology. *Current Biology* 22(20): R887–R892. https://doi.org/10.1016/j.cub.2012.09.001 — **abstract** (PubMed).
19. Levy G, Hochner B (2017). Embodied organization of *Octopus vulgaris* morphology, vision, and locomotion. *Frontiers in Physiology* 8: 164. https://doi.org/10.3389/fphys.2017.00164 — **summary** of open-access full text.
20. Carls-Diamante S (2022). Where is it like to be an octopus? *Frontiers in Systems Neuroscience* 16: 840022. https://doi.org/10.3389/fnsys.2022.840022 — **summary** of open-access full text.
21. Olson CS, Schulz NG, Ragsdale CW (2025). Neuronal segmentation in cephalopod arms. *Nature Communications* 16: 443. https://doi.org/10.1038/s41467-024-55475-5 — **summary** of open-access full text (PMC11736069).
22. Rowell CHF (1963). Excitatory and inhibitory pathways in the arm of *Octopus*. *Journal of Experimental Biology* 40(2): 257–270. https://doi.org/10.1242/jeb.40.2.257 — **secondary** (via ref. 20).
23. Budelmann BU (1995). The cephalopod nervous system: what evolution has made of the molluscan design. In: *The Nervous Systems of Invertebrates*, pp. 115–138. Birkhäuser. https://doi.org/10.1007/978-3-0348-9219-3_7 — **title only**.
24. Kier WM, Smith KK (1985). Tongues, tentacles and trunks: the biomechanics of movement in muscular-hydrostats. *Zoological Journal of the Linnean Society* 83(4): 307–324. https://doi.org/10.1111/j.1096-3642.1985.tb01178.x — **title only**.
25. Kier WM, Stella MP (2007). The arrangement and function of octopus arm musculature and connective tissue. *Journal of Morphology* 268(10): 831–843. https://doi.org/10.1002/jmor.10548 — **abstract**.
26. Kier WM (2016). The musculature of coleoid cephalopod arms and tentacles. *Frontiers in Cell and Developmental Biology* 4: 10. https://doi.org/10.3389/fcell.2016.00010 — **summary** of open-access full text.
27. Kennedy EBL, Buresch KC, Boinapally P, Hanlon RT (2020). Octopus arms exhibit exceptional flexibility. *Scientific Reports* 10: 20872. https://doi.org/10.1038/s41598-020-77873-7 — **abstract**.
28. Kier WM, Smith AM (2002). The structure and adhesive mechanism of octopus suckers. *Integrative and Comparative Biology* 42(6): 1146–1153. https://doi.org/10.1093/icb/42.6.1146 — **abstract** (PubMed).
29. Kier WM, Smith AM (1990). The morphology and mechanics of octopus suckers. *The Biological Bulletin* 178(2): 126–136. https://doi.org/10.2307/1541971 — **title only**.
30. Tramacere F, Beccai L, Kuba M, Gozzi A, Bifone A, Mazzolai B (2013). The morphology and adhesion mechanism of *Octopus vulgaris* suckers. *PLoS ONE* 8(6): e65074. https://doi.org/10.1371/journal.pone.0065074 — **summary** of open-access full text.
31. van Giesen L, Kilian PB, Allard CAH, Bellono NW (2020). Molecular basis of chemotactile sensation in octopus. *Cell* 183(3): 594–604.e14. https://doi.org/10.1016/j.cell.2020.09.008 — **title only**.
32. Graziadei PPC, Gagne HT (1976). Sensory innervation in the rim of the octopus sucker. *Journal of Morphology* 150(3): 639–679. https://doi.org/10.1002/jmor.1051500304 — **title only**.
33. Wells MJ, Smith PJS (1987). The performance of the octopus circulatory system: a triumph of engineering over design. *Experientia* 43(5): 487–499. https://doi.org/10.1007/BF02143577 — **title only**.
34. Wells MJ (1978). *Octopus: Physiology and Behaviour of an Advanced Invertebrate*. Chapman & Hall, London. — **not read**; standard reference for general anatomy and physiology.
35. Hanlon RT, Messenger JB (2018). *Cephalopod Behaviour*, 2nd edn. Cambridge University Press. https://doi.org/10.1017/9780511843600 — **not read**; standard reference.

PubMed was used to retrieve the metadata and abstracts for references 2, 14, 15, 16, 17, 18 and 28.

export const profile = {
  name: "Mohammadreza Norouzi",
  location: "Vancouver, British Columbia, Canada",
  introduction:
    "Exploring the intersection of medicine, research, and emerging technologies to advance evidence-based healthcare.",
  bio: "I am Mohammadreza Norouzi, an Iranian medical graduate based in Vancouver, British Columbia. My background spans independent general medical practice in Iran, primary healthcare, medical research, and scientific writing.",
  disclosure:
    "I am not licensed to practise medicine in British Columbia, Canada.",
  education: [
    {
      title: "Doctor of Medicine (MD)",
      institution: "Fasa University of Medical Sciences",
      place: "Iran",
    },
    {
      title: "Executive Healthcare MBA certificate",
      institution: "Shahid Beheshti University of Medical Sciences",
      place: "Iran",
    },
  ],
  experience: [
    {
      title: "General medical practice",
      detail: "Previous independent general medical practice in Iran.",
    },
    {
      title: "Primary healthcare",
      detail:
        "Experience in primary healthcare through clinical practice in Iran.",
    },
    {
      title: "Medical research and scientific writing",
      detail:
        "Participation in research activities and the communication of scientific ideas in writing.",
    },
  ],
  skills: ["Scientific writing", "Medical research", "Primary healthcare"],
  research: [
    {
      title: "Clinical research",
      icon: "activity",
      description:
        "How clinical questions become studies that can inform patient care.",
    },
    {
      title: "Neuroscience",
      icon: "brain",
      description:
        "The relationship between brain structure, function, and clinical observations.",
    },
    {
      title: "AI in healthcare",
      icon: "network",
      description:
        "How to evaluate medical AI in the settings where people use it.",
    },
    {
      title: "Evidence-based medicine",
      icon: "book",
      description:
        "Reading and interpreting evidence in the context of a clinical decision.",
    },
    {
      title: "Epidemiology",
      icon: "chart",
      description:
        "How study design shapes our understanding of health across populations.",
    },
    {
      title: "Healthcare innovation",
      icon: "layers",
      description:
        "How health services research can guide changes in care delivery.",
    },
  ],
  // Populate only after verification. Use a public, owner-approved PDF in public/.
  cvPath: null as string | null,
  portrait: null as {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null,
  email: null as string | null,
  profiles: [{ label: "GitHub", url: "https://github.com/iamdrtnt" }] as {
    label: string;
    url: string;
  }[],
};
export type Publication = {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  type: string;
  doi?: string;
  abstract?: string;
  url?: string;
  pubmed?: string;
};
// Add confirmed publication records only.
export const publications: Publication[] = [];
export const projects: { title: string; description: string; url?: string }[] =
  [];
export const presentations: { title: string; meeting: string; year: number }[] =
  [];
export const achievements: string[] = [];
export const navigation = [
  ["Home", "/"],
  ["About", "/about/"],
  ["Experience", "/experience/"],
  ["Research", "/research/"],
  ["Blog", "/blog/"],
  ["CV", "/cv/"],
  ["Contact", "/contact/"],
] as const;

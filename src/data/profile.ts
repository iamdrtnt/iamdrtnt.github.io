export const profile = {
  name: "Mohammadreza Norouzi",
  location: "Vancouver, British Columbia, Canada",
  title: "International Medical Graduate | Research & Healthcare Innovation",
  introduction: "My perspective on medicine extends beyond individual patient care. I am driven by a commitment to improving healthcare systems through research, strategic thinking, and innovation, with the goal of making better care accessible to more people worldwide.",
  bio: "My journey into medicine began with a simple curiosity: understanding the human body, how it works, and how science can help improve human health.",
  summary: "International medical graduate who provided independent general medical care as a Most Responsible Physician in Iran, including preventive healthcare and patient education. My professional interests bring together clinical medicine, evidence-based research, healthcare management, and innovation, with a particular focus on improving access to healthcare.",
  disclosure: "Iranian MD graduate.",
  education: [
    {
      title: "Doctor of Medicine (MD)",
      institution: "Fasa University of Medical Sciences",
      place: "Iran",
    },
    {
      title: "Executive Healthcare MBA Certificate",
      institution: "Shahid Beheshti University of Medical Sciences",
      place: "Iran",
    },
  ],
  experience: [
    {
      title: "Clinical Internship",
      date: "2023–2024",
      place: "Fasa University of Medical Sciences, Iran",
      detail: "Completed an 18-month clinical internship across major medical specialties, developing experience in clinical assessment, clinical reasoning, and multidisciplinary patient care.",
    },
    {
      title: "Most Responsible Physician",
      date: "2024–2026",
      place: "Iran",
      detail: "Provided independent general medical care, including clinical assessment, diagnosis, management planning, preventive healthcare, and patient education.",
    },
  ],
  training: ["Good Clinical Practice (GCP)", "TCPS 2 CORE — Research Ethics", "Aesthetic Medicine Training — Botulinum Toxin & Dermal Fillers"],
  skills: ["Clinical Decision-Making", "Primary Healthcare", "Preventive Medicine", "Team Coordination"],
  interests: ["Clinical Medicine", "Clinical Research", "Evidence-Based Medicine", "Healthcare Management", "Digital Health", "Healthcare Innovation"],
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
  email: "norouzimd.work@gmail.com",
  profiles: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/drtnt/" }, { label: "GitHub", url: "https://github.com/iamdrtnt" }] as {
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
export const professionalTimeline = [
  ...profile.experience.map((entry) => ({
    ...entry,
    status: "completed",
    label: entry.date,
  })),
  {
    status: "future",
    label: "The next chapter · Canada",
    title: "Working Toward Medical Licensure",
    detail: "Continuing my professional journey toward becoming a licensed physician in Canada.",
  },
];

export const achievements: string[] = ["Fasa Startup Weekend (2018) — Originator of the startup idea and leader of the second-place team."];
export const navigation = [
  ["Home", "/"],
  ["About", "/about/"],
  ["Experience", "/experience/"],
  ["Research", "/research/"],
  ["Blog", "/blog/"],
  ["CV", "/cv/"],
  ["Contact", "/contact/"],
] as const;

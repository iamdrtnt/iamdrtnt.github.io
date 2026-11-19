import { achievements, navigation, profile, professionalTimeline } from "../data/profile";
import { localPath, type Locale } from "./locales";

const persian = {
  name: "محمدرضا نوروزی",
  location: "ونکوور، بریتیش کلمبیا، کانادا",
  title: "دانش‌آموختهٔ بین‌المللی پزشکی | پژوهش و نوآوری در سلامت",
  introduction: "نگاه من به پزشکی از مراقبت از تک‌تک بیماران فراتر می‌رود. می‌خواهم با پژوهش، تفکر راهبردی و نوآوری به بهبود نظام‌های سلامت کمک کنم تا افراد بیشتری در سراسر جهان به مراقبت باکیفیت دسترسی داشته باشند.",
  bio: "مسیر من در پزشکی با کنجکاوی ساده‌ای آغاز شد. می‌خواستم بدانم بدن انسان چگونه کار می‌کند و علم چطور می‌تواند به بهبود سلامت انسان کمک کند.",
  summary: "دانش‌آموختهٔ بین‌المللی پزشکی با سابقهٔ ارائهٔ مستقل خدمات پزشکی عمومی در ایران به‌عنوان پزشک مسئول اصلی، از جمله مراقبت پیشگیرانه و آموزش بیماران. علایق حرفه‌ای من پزشکی بالینی، پژوهش مبتنی بر شواهد، مدیریت سلامت و نوآوری را با تمرکز بر بهبود دسترسی به خدمات سلامت به هم پیوند می‌دهد.",
  disclosure: "دانش‌آموختهٔ دکترای پزشکی در ایران.",
  education: [
    { title: "دکترای حرفه‌ای پزشکی (MD)", institution: "دانشگاه علوم پزشکی فسا", place: "ایران" },
    { title: "گواهی دورهٔ مدیریت اجرایی کسب‌وکار در سلامت (MBA)", institution: "دانشگاه علوم پزشکی شهید بهشتی", place: "ایران" },
  ],
  experience: [
    { title: "کارورزی بالینی", place: "دانشگاه علوم پزشکی فسا، ایران", detail: "دورهٔ ۱۸ماههٔ کارورزی بالینی را در رشته‌های اصلی پزشکی گذراندم و در ارزیابی و استدلال بالینی و مراقبت چندتخصصی از بیماران تجربه کسب کردم." },
    { title: "پزشک مسئول اصلی", place: "ایران", detail: "خدمات پزشکی عمومی را به‌صورت مستقل ارائه دادم. این خدمات شامل ارزیابی بالینی، تشخیص، برنامه‌ریزی درمان، مراقبت پیشگیرانه و آموزش بیماران بود." },
  ],
  training: ["اصول عملکرد خوب بالینی (GCP)", "دورهٔ اخلاق پژوهش (TCPS 2 CORE)", "آموزش پزشکی زیبایی، سم بوتولینوم و فیلرهای پوستی"],
  skills: ["تصمیم‌گیری بالینی", "مراقبت‌های اولیهٔ سلامت", "پزشکی پیشگیرانه", "هماهنگی تیم"],
  interests: ["پزشکی بالینی", "پژوهش بالینی", "پزشکی مبتنی بر شواهد", "مدیریت سلامت", "سلامت دیجیتال", "نوآوری در سلامت"],
};

const research = [
  ["پژوهش بالینی", "چگونه پرسش‌های بالینی به مطالعه‌هایی تبدیل می‌شوند که می‌توانند تصمیم‌گیری در مراقبت از بیماران را هدایت کنند."],
  ["علوم اعصاب", "رابطهٔ ساختار و عملکرد مغز با مشاهدات بالینی."],
  ["هوش مصنوعی در سلامت", "چگونگی ارزیابی هوش مصنوعی پزشکی در محیط‌هایی که در آن‌ها به کار می‌رود."],
  ["پزشکی مبتنی بر شواهد", "خواندن و تفسیر شواهد در چارچوب یک تصمیم بالینی."],
  ["همه‌گیرشناسی", "چگونه طراحی مطالعه بر درک ما از سلامت در جمعیت‌های مختلف اثر می‌گذارد."],
  ["نوآوری در سلامت", "چگونه پژوهش در خدمات سلامت می‌تواند تغییر در شیوهٔ ارائهٔ مراقبت را هدایت کند."],
] as const;

const localDigits = (text: string) => text.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function profileFor(locale: Locale) {
  return {
    ...profile,
    ...(locale === "fa" ? persian : {}),
    experience: profile.experience.map((entry, index) => locale === "fa"
      ? { ...entry, ...persian.experience[index], date: localDigits(entry.date) }
      : entry),
    research: profile.research.map((entry, index) => ({
      ...entry,
      id: entry.title.toLowerCase().replaceAll(" ", "-"),
      ...(locale === "fa" ? { title: research[index][0], description: research[index][1] } : {}),
    })),
  };
}

const navigationLabels = ["خانه", "درباره", "سوابق", "پژوهش", "مجله", "رزومه", "تماس"];

export function navigationFor(locale: Locale) {
  return navigation.map(([label, path], i) => ({
    label: locale === "fa" ? navigationLabels[i] : label,
    path,
    href: localPath(path, locale),
  }));
}

export function timelineFor(locale: Locale) {
  if (locale === "en") return professionalTimeline;
  return [
    ...profileFor(locale).experience.map((entry) => ({
      ...entry,
      status: "completed",
      label: entry.date,
    })),
    {
      status: "future",
      label: "گام بعدی · کانادا",
      title: "در مسیر دریافت پروانهٔ پزشکی در کانادا",
      detail: "در حال طی کردن مراحل لازم برای دریافت پروانهٔ طبابت در کانادا هستم.",
      place: undefined,
    },
  ];
}

export function achievementsFor(locale: Locale) {
  return locale === "fa"
    ? ["استارتاپ ویکند فسا (۲۰۱۸)؛ صاحب ایدهٔ استارتاپ و سرپرست تیمی که مقام دوم را کسب کرد."]
    : achievements;
}

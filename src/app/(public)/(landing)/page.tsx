import { Brands } from "./_components/brands";
import { CategoryBento } from "./_components/category-bento";
import { ClosingCTA } from "./_components/closing-cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { LatestProducts } from "./_components/latest-products";
import {
  Testimonials,
  type TestimonialItem,
} from "./_components/testimonials";
import { TrustStrip } from "./_components/trust-strip";

const testimonials: TestimonialItem[] = [
  {
    name: "Omar Magdy",
    rating: 5,
    content:
      "أول مرة أطلب حاجة من برة ويوصلني بالسهولة دي كلو أصلي ومفيش جمارك ولا وجع دماغ حسيت إني أخيرًا بشتري زي الناس الي برا.",
  },
  {
    name: "Salma Hany",
    rating: 5,
    content:
      "بجد خدمة محترمة جدًا الطلب وصل في كام يوم والتغليف كان كويس أول مرة أتعامل مع موقع في مصر بيهتم بالجيمرز كده.",
  },
  {
    name: "Ahmed Ziad",
    rating: 5,
    content:
      "كنت فاكر الموضوع هيبقى معقد بس كل حاجة مشييت بسلاسة الأسعار تمام والموقع حلو وسهل تتعامل معاه",
  },
  {
    name: "Mariam El Gendy",
    rating: 4,
    content:
      "طلبت ماوس وكيبورد وصلوا أسرع مما توقعت وبجودة ممتازة التجربة كلها كانت مريحة جدًا.",
  },
  {
    name: "Youssef Adel",
    rating: 5,
    content:
      "بصراحة ماكنتش متوقع الخدمة تبقى بالمستوى ده الحاجة وصلت متأمنة ومتغلفةكويس شكراً إنكم فاهمين الجيمرز بجد",
  },

  {
    name: "Farah Khalil",
    rating: 5,
    content:
      "الموقع شكله جامد جدًا وسهل أتعامل معاه حسيت إن أخيرًا في ناس بتفكر فينا إحنا الجيمرز اللي في مصر",
  },
  {
    name: "Nadine Saad",
    rating: 4,
    content:
      "المنتجات أصلية 100% والتغليف محترم ناقص بس شوية تنويع في البراندات وهتبقوا نمبر وان",
  },
  {
    name: "Khaled Nour",
    rating: 5,
    content:
      "أكتر حاجة عجبتني إنهم بيردوا بسرعة جدًا على الاستفسارات فعلاً تحس إنهم فاهمين السوق المصري كويس",
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <LatestProducts />
      <CategoryBento />
      <HowItWorks />
      <Brands />
      <Testimonials testimonials={testimonials} />
      <FAQ />
      <ClosingCTA />
    </>
  );
}

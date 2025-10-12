import { CTA } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { ProblemSolutions } from "./_components/problem-solutions";
import { RecentProducts } from "./_components/recent-products";
import { ShopByBrand } from "./_components/shop-by-brand";
import type { TestimonialItem } from "./_components/testimonials";
import Testimonials from "./_components/testimonials";

// FIX: the hydrate client is not working unless the page is dynamic
// export const dynamic = "force-dynamic";
const testimonials: TestimonialItem[] = [
  {
    name: "Omar Magdy",
    avatar: "",
    rating: 5,
    content:
      "أول مرة أطلب حاجة من برة ويوصلني بالسهولة دي! كله أصلي ومفيش جمارك ولا وجع دماغ. حسيت إني أخيرًا بشتري زي الناس برا.",
  },
  {
    name: "Salma Hany",
    avatar: "",
    rating: 5,
    content:
      "بجد خدمة محترمة جدًا. الطلب وصل في كام يوم والتغليف جامد جدًا. أول مرة أتعامل مع موقع في مصر بيهتم بالجيمرز كده.",
  },
  {
    name: "Ahmed Ziad",
    avatar: "",
    rating: 5,
    content:
      "كنت فاكر الموضوع هيبقى معقد، بس كل حاجة ماشية بسلاسة. الأسعار تمام والموقع شكله حلو وسهل تتعامل معاه.",
  },
  {
    name: "Mariam El Gendy",
    avatar: "",
    rating: 4,
    content:
      "طلبت ماوس وكيبورد، وصلوا أسرع مما توقعت وبجودة ممتازة. التجربة كلها كانت مريحة جدًا.",
  },
  {
    name: "Youssef Adel",
    avatar: "",
    rating: 5,
    content:
      "بصراحة ماكنتش متوقع الخدمة تبقى بالمستوى ده. الحاجة وصلت متأمنة ومتغلفة زي المحلات الكبيرة برا. شكراً إنكم فاهمين الجيمرز بجد!",
  },

  {
    name: "Farah Khalil",
    avatar: "",
    rating: 5,
    content:
      "الموقع شكله جامد جدًا وسهل أوي أتعامل معاه. حسيت إن أخيرًا في ناس بتفكر فينا إحنا الجيمرز اللي في مصر!",
  },

  {
    name: "Nadine Saad",
    avatar: "",
    rating: 4,
    content:
      "المنتجات أصلية 100% والتغليف محترف. ناقص بس شوية تنويع في البراندات وهتبقوا نمبر وان!",
  },
  {
    name: "Khaled Nour",
    avatar: "",
    rating: 5,
    content:
      "أكتر حاجة عجبتني إنهم بيردوا بسرعة جدًا على الاستفسارات. فعلاً تحس إنهم فاهمين السوق المصري كويس.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="via-background absolute -inset-x-0 -bottom-24 -z-10 h-64 bg-gradient-to-b from-transparent from-0% via-50% to-transparent to-100%" />

      <RecentProducts />

      <ProblemSolutions />

      <Testimonials testimonials={testimonials} />

      <ShopByBrand />
      <FAQ />
      <CTA />
    </>
  );
}

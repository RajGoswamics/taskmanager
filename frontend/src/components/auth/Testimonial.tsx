import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const QUOTES = [
  {
    quote: 'taskMeter changed how our team plans sprints — fewer meetings, more shipping.',
    name: 'Mira Chen',
    role: 'Product Lead, Acme Inc.',
    avatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    quote: 'The cleanest task manager I have used. It feels native and gets out of the way.',
    name: 'Ravi Kapoor',
    role: 'Engineering Manager, Northwind',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    quote: 'Onboarded the whole team in under 10 minutes. Zero training, instant adoption.',
    name: 'Lena Hoffmann',
    role: 'COO, Studio Forty',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
];

export default function Testimonial() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const t = QUOTES[i];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-1 text-amber-300">
        {Array.from({ length: 5 }).map((_, k) => (
          <Star key={k} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <blockquote
        key={i}
        className="text-2xl font-bold leading-tight text-white animate-fade-in min-h-[5.5rem]"
      >
        “{t.quote}”
      </blockquote>
      <div className="mt-5 flex items-center gap-3">
        <img
          src={t.avatar}
          alt={t.name}
          className="h-11 w-11 rounded-full ring-2 ring-white/30 object-cover"
        />
        <div className="text-white">
          <div className="text-sm font-semibold">{t.name}</div>
          <div className="text-xs opacity-80">{t.role}</div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-1.5">
        {QUOTES.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Show testimonial ${k + 1}`}
            className={`h-1 rounded-full transition-all ${
              i === k ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

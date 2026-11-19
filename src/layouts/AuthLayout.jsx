import { Outlet } from 'react-router-dom'
import { BookOpen, Calculator, Trophy, Sparkles } from 'lucide-react'
import { Logo } from '../components/ui'
import { isFirebaseConfigured } from '../firebase/firebase'

const features = [
  { icon: BookOpen, t: "Ingliz tili — noldan C2 gacha", d: 'Starter dan Proficiency gacha 7 ta daraja' },
  { icon: Trophy, t: 'CEFR · IELTS · TOEFL', d: 'Xalqaro imtihonlarga tayyorgarlik' },
  { icon: Calculator, t: 'Matematika noldan', d: 'Arifmetikadan algebra va statistikagacha' },
  { icon: Sparkles, t: 'Avtomatik daraja aniqlash', d: 'Placement test orqali sizga mos kurs' },
]

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 animate-float rounded-full bg-neon-purple/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 animate-float rounded-full bg-neon-blue/20 blur-3xl [animation-delay:2s]" />
        <Logo size="lg" />
        <div className="relative">
          <h1 className="font-display text-5xl font-extrabold leading-tight">
            Tilni va fanni <span className="gradient-text">professional</span> darajada o'rganing
          </h1>
          <div className="mt-10 grid gap-4">
            {features.map(({ icon: I, t, d }) => (
              <div key={t} className="glass flex items-center gap-4 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30"><I className="h-6 w-6" /></div>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-slate-500">© {new Date().getFullYear()} LINGUA PRO</p>
      </aside>
      <main className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="mb-8 lg:hidden"><Logo /></div>
          {!isFirebaseConfigured && (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              Firebase sozlanmagan. <code>.env</code> faylini <code>.env.example</code> asosida to'ldiring.
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

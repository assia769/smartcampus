import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

interface Feedback {
  name: string
  role: string
  rating: number
  text: string
}

// Exemples fictifs : à remplacer plus tard par les vrais feedbacks (API Spring Boot)
const feedbacks: Feedback[] = [
  { name: 'Salma B.', role: 'Étudiante, 2e année GI', rating: 5, text: "Je trouve une salle libre en 10 secondes. Fini les couloirs à chercher un local !" },
  { name: 'Pr. Karim El A.', role: 'Enseignant', rating: 5, text: "La réservation longue durée et la demande d'amphi sont d'une simplicité remarquable." },
  { name: 'Yassine M.', role: 'Étudiant, 3e année', rating: 5, text: "Les rappels avant le début de ma réservation m'ont sauvé plus d'une fois." },
  { name: 'Hajar T.', role: 'Étudiante', rating: 4, text: "Interface claire, calendrier lisible, et je peux réserver le micro avec la salle." },
  { name: 'M. Driss R.', role: 'Gestionnaire de stock', rating: 5, text: "Le suivi du matériel et les alertes de stock faible me font gagner un temps précieux." },
  { name: 'Imane K.', role: 'Étudiante', rating: 5, text: "Signaler un incident prend 30 secondes, et le suivi est transparent." },
]

function Card({ f }: { f: Feedback }) {
  return (
    <figure className="relative w-80 shrink-0 rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-white/15">
      <Quote size={28} className="absolute right-5 top-5 text-gold/40" />
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className={i < f.rating ? 'fill-gold text-gold' : 'text-white/30'} />
        ))}
      </div>
      <blockquote className="text-sm leading-relaxed text-white/90">« {f.text} »</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-bordeaux-500 to-bordeaux-900 text-sm font-semibold ring-2 ring-gold/50">
          {f.name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold">{f.name}</span>
          <span className="block text-xs text-white/60">{f.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export default function Testimonials() {
  const loop = [...feedbacks, ...feedbacks]
  return (
    <section className="relative w-full pb-14 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Ils nous font confiance</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          Ce que dit la communauté
        </h2>
      </motion.div>

      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee-track flex w-max gap-6 px-3">
          {loop.map((f, i) => <Card key={i} f={f} />)}
        </div>
      </div>
    </section>
  )
}
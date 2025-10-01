import { Metadata } from "next";
import Link from "next/link";
import { Gift, Users, Sparkles, TicketPercent, Leaf, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Programme de parrainage | Chanvre Vert",
  description:
    "Invitez vos proches à découvrir Chanvre Vert : -15% pour leur première commande et un bon -30% pour vous remercier.",
};

const highlights = [
  {
    icon: Gift,
    title: "-15% pour vos proches",
    description: "Votre filleul profite de 15% sur sa première commande dès 60 € d'achat.",
  },
  {
    icon: TicketPercent,
    title: "-30% pour vous",
    description: "À chaque filleul validé, recevez un bon -30% valable sur une commande de 100 € ou plus.",
  },
  {
    icon: Clock,
    title: "90 jours pour en profiter",
    description: "Votre bon est utilisable pendant 3 mois après son attribution, le temps de planifier votre prochaine commande.",
  },
  {
    icon: ShieldCheck,
    title: "Programme équitable",
    description: "Anti-auto-parrainage, 1 bon par filleul validé : nous sécurisons les récompenses de la communauté.",
  },
];

const steps = [
  {
    title: "1. Obtenez votre code",
    description:
      "Connectez-vous à votre compte Chanvre Vert pour récupérer votre lien personnel depuis l&apos;espace parrainage.",
  },
  {
    title: "2. Partagez autour de vous",
    description:
      "Envoyez le lien ou le code promo à vos proches : ils bénéficient automatiquement de -15% sur leur première commande admissible.",
  },
  {
    title: "3. Recevez votre récompense",
    description:
      "Une fois la commande du filleul validée, nous créditons votre bon -30% (minimum de commande 100 €) dans votre espace client.",
  },
];

const faq = [
  {
    question: "Comment fonctionne la réduction pour mon filleul ?",
    answer:
      "Le code parrain offre 15% de remise sur la première commande dès 60 € de produits éligibles (hors frais de livraison). Le code n’est pas cumulable avec d&apos;autres promotions en cours.",
  },
  {
    question: "Quand est-ce que je reçois ma récompense ?",
    answer:
      "Dès que la commande du filleul est payée et validée, nous générons pour vous un bon -30% utilisable sur 100 € d'achat minimum, valable 90 jours et à usage unique.",
  },
  {
    question: "Puis-je parrainer plusieurs personnes ?",
    answer:
      "Oui ! Chaque filleul validé vous rapporte un nouveau bon -30%. Nous veillons simplement à éviter l'auto-parrainage ou les comptes dupliqués.",
  },
  {
    question: "Où retrouver mes codes ?",
    answer:
      "Tout se passe dans votre compte, section “Parrainage”. Vous y trouverez votre lien de partage, le suivi de vos filleuls et vos récompenses actives.",
  },
];

export default function ParrainagePage() {
  return (
    <div className="bg-[#012630] min-h-screen">
      <header className="bg-gradient-to-br from-[#02434f] to-[#012d38] py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00343f] border border-white/10 px-4 py-2 rounded-full text-sm text-[#8DD9BE]">
            <Leaf size={16} />
            Programme de parrainage Chanvre Vert
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Partagez le bien-être naturel et récoltez de belles récompenses
          </h1>
          <p className="text-[#C8D2D6] max-w-2xl mx-auto">
            Invitez vos proches à découvrir nos produits CBD premium : ils profitent d&apos;une remise immédiate sur leur première commande et vous recevez un bon exclusif pour vos prochains achats.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/compte/parrainage"
              className="px-6 py-3 rounded-md bg-[#10B981] text-[#07211f] font-semibold shadow-lg hover:bg-[#13d39a] transition"
            >
              Accéder à mon espace parrainage
            </Link>
            <Link
              href="/inscription"
              className="px-6 py-3 rounded-md border border-[#10B981] text-[#10B981] font-semibold hover:bg-[#013842] transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-6xl space-y-16">
        {/* Points clés */}
        <section className="grid gap-6 md:grid-cols-2">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-xl border border-white/10 bg-[#01313c] flex gap-4">
              <div className="mt-1">
                <Icon size={28} className="text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-[#B7C3C6] mt-2 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Étapes */}
        <section className="bg-[#012d38] border border-white/10 rounded-2xl px-6 py-8 md:px-10 md:py-12">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Users className="text-[#10B981]" /> Comment parrainer ?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ title, description }, index) => (
              <div key={title} className="bg-[#013945] rounded-xl p-6 border border-white/10">
                <div className="text-[#10B981] font-bold text-sm mb-2">Étape {index + 1}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#B7C3C6] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="text-[#10B981]" /> Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faq.map(({ question, answer }) => (
              <div key={question} className="bg-[#01313c] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
                <p className="text-sm text-[#B7C3C6] leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-[#011c24] border border-white/5 rounded-xl p-5 text-xs text-[#6C7C81] leading-relaxed">
          <p>
            Le programme de parrainage Chanvre Vert est accessible à tous les clients disposant d&apos;un compte Chanvre Vert. Les remises ne sont pas cumulables avec d&apos;autres promotions ou codes en cours. Nous nous réservons le droit de suspendre ou modifier le programme en cas d&apos;abus ou de changements réglementaires. Pour toute question, contactez-nous à
            {" "}
            <Link href="mailto:contact@chanvre-vert.fr" className="text-[#10B981] hover:underline">
              contact@chanvre-vert.fr
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

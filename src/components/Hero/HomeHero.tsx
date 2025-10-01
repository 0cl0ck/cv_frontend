import Link from "next/link";

export default function HomeHero() {
  return (
    <div
      className="relative min-h-[100vh] flex items-center justify-center text-white bg-gray-800"
      data-theme="dark"
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/glass_anim.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>

      <div className="container mx-auto px-4 z-10 relative flex items-center md:justify-between justify-center py-16 md:py-24 pt-28 md:pt-32">
        <div className="max-w-[36.5rem] text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Chanvre Vert
            <br />
            CBD Premium
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Explorez notre gamme de produits CBD premium:
            <br />
            Naturel, certifi\u00E9 et efficace.
            <br />
            Livraison rapide et discr\u00E8te partout en France.
          </p>
          <ul className="flex justify-center md:justify-start gap-4">
            <li>
              <Link
                href="/produits"
                className="btn px-6 py-3 rounded-lg inline-flex items-center justify-center bg-[#EFC368] hover:bg-[#d9ae5a] text-black"
              >
                D\u00E9couvrir nos produits
              </Link>
            </li>
            <li>
              <Link
                href="/a-propos"
                className="btn btn-outline px-6 py-3 rounded-lg border-2 border-white hover:bg-white hover:text-green-800 transition-colors inline-flex items-center justify-center"
              >
                En savoir plus
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:block text-right">
          <p className="text-[#EFC368] font-bold text-xl lg:text-2xl">
            Jusqu\u2019\u00E0 25G offerts
          </p>
        </div>
      </div>
    </div>
  );
}

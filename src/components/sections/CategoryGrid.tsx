'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";

export type CategoryCard = {
  title: string;
  src: string;
  href: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const CategoryCardItem = ({
  category,
  index,
}: {
  category: CategoryCard;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="h-full"
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={category.href} className="block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-[#004942] shadow-md">
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.div
              className="relative h-full w-full"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={category.src}
                alt={category.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 4}
                quality={90}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-[#004942] to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: isHovered ? 0.6 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          <div className="flex flex-grow items-center justify-between p-4">
            <motion.h3
              className="text-lg font-medium text-white"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.title}
            </motion.h3>
            <motion.div
              className="rounded-full bg-white/10 p-2 text-white"
              animate={{
                x: isHovered ? 4 : 0,
                backgroundColor: isHovered
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              }}
              transition={{ duration: 0.2 }}
            >
              <IconArrowRight size={18} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const categories: CategoryCard[] = [
  {
    title: "Huiles CBD",
    src: "/images/categories/categorie_huile_cbd.webp",
    href: "/produits/categorie/huiles-cbd",
  },
  {
    title: "Fleurs CBD",
    src: "/images/categories/categorie_fleurs_cbd.webp",
    href: "/produits/categorie/fleurs-cbd",
  },
  {
    title: "Infusions CBD",
    src: "/images/categories/categorie_infusion_cbd.webp",
    href: "/produits/categorie/infusions-cbd",
  },
  {
    title: "R\u00E9sine CBD",
    src: "/images/categories/categorie_resine_cbd.webp",
    href: "/produits/categorie/resine-cbd",
  },
  {
    title: "G\u00E9lules CBD",
    src: "/images/categories/categorie_gelules_cbd.webp",
    href: "/produits/categorie/gelules-cbd",
  },
  {
    title: "Packs CBD",
    src: "/images/categories/categorie_packs_cbd.webp",
    href: "/produits/categorie/packs-cbd",
  },
];

export default function CategoryGrid() {
  return (
    <section className="relative overflow-hidden bg-[#00333e] py-16">
      <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#004942] opacity-5"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#004942] opacity-5"></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 h-8 w-1.5 rounded-full bg-[#004942]"></div>
            <h2 className="text-3xl font-bold text-white">Cat\u00E9gories</h2>
          </div>
          <Link
            href="/produits"
            className="group hidden items-center text-white transition-all duration-300 hover:text-green-200 sm:flex"
          >
            <span className="mr-2">Tous les produits</span>
            <motion.div
              className="rounded-full p-1"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <IconArrowRight size={18} />
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCardItem key={category.title} category={category} index={index} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produits"
            className="inline-flex items-center rounded-lg bg-[#004942] px-5 py-2.5 text-white transition-colors hover:bg-[#00594f]"
          >
            <span>Tous les produits</span>
            <IconArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

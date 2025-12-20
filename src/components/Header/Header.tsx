'use client';

import type { JSX } from "react";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import type { Category } from "@/types/product";
import {
  IconMenu2,
  IconX,
  IconShoppingCart,
  IconUser,
  IconChevronDown,
} from "@tabler/icons-react";
import { useAuthContext } from "@/context/AuthContext";
import { useCartContext } from "@/context/CartContext";
import { getCategories, fallbackCategories } from "@/services/api";
import MobileMenu from "./MobileMenu";
import UserAccountMenu from "./UserAccountMenu";
import { cn } from "@/utils/utils";

type NavChild = {
  name: string;
  link: string;
  description?: string;
  image?: string;
};

type NavItem = {
  name: string;
  link?: string;
  children?: NavChild[];
};

type MobileNavItem = {
  label: string;
  url: string;
};

type HeaderProps = {
  initialCategories?: Category[];
};

const springTransition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const mapCategoryToNavChild = (category: Category): NavChild => {
  const rawImage = category.image;
  const imageUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.sizes?.card?.url ??
        rawImage?.sizes?.thumbnail?.url ??
        rawImage?.url ??
        null;

  const description =
    typeof category.description === "string" && category.description.trim().length > 0
      ? category.description.trim()
      : undefined;

  return {
    name: category.name,
    link: `/produits/categorie/${category.slug}`,
    description,
    image: imageUrl ?? undefined,
  };
};

const fallbackProductHighlights: NavChild[] = fallbackCategories.map(mapCategoryToNavChild);

const parrainageHighlights: NavChild[] = [
  {
    name: "Programme de parrainage",
    link: "/parrainage",
    description: "Invitez vos proches et gagnez des recompenses exclusives.",
  },
  {
    name: "FAQ Parrainage",
    link: "/parrainage#faq",
    description: "Toutes les reponses pour profiter du programme.",
  },
];

const blogHighlights: NavChild[] = [
  {
    name: "Tous les articles",
    link: "/blog",
    description: "Guides, conseils et actualités sur le CBD.",
  },
  {
    name: "Articles piliers",
    link: "/blog?pillar=true",
    description: "Nos guides complets pour bien débuter.",
  },
];

const mobileNavConfig: MobileNavItem[] = [
  { label: "Produits", url: "/produits" },
  { label: "Blog", url: "/blog" },
  { label: "Parrainage", url: "/parrainage" },
  { label: "Panier", url: "/panier" },
];

export default function Header({ initialCategories }: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const { cart } = useCartContext();

  const hasInitialCategories = Array.isArray(initialCategories) && initialCategories.length > 0;
  const fallbackCategoryData = hasInitialCategories ? initialCategories : fallbackCategories;

  const { data: categories } = useSWR<Category[]>("header-categories", getCategories, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    fallbackData: fallbackCategoryData,
    revalidateOnMount: !hasInitialCategories,
  });

  const productHighlights = useMemo<NavChild[]>(() => {
    const usableCategories = (categories ?? []).filter((category) => category.isActive !== false);
    const highlights = usableCategories.map(mapCategoryToNavChild);
    return highlights.length > 0 ? highlights : fallbackProductHighlights;
  }, [categories]);

  const desktopNavItems = useMemo<NavItem[]>(
    () => [
      {
        name: "Produits",
        link: "/produits",
        children: productHighlights,
      },
      {
        name: "Blog",
        link: "/blog",
        children: blogHighlights,
      },
      {
        name: "Parrainage",
        link: "/parrainage",
        children: parrainageHighlights,
      },
    ],
    [productHighlights],
  );

  const mobileProductLinks = useMemo<MobileNavItem[]>(() => {
    return productHighlights.map((child) => ({
      label: child.name,
      url: child.link,
    }));
  }, [productHighlights]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccountMenuOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const body = document.body;
    body.style.overflow = menuOpen ? "hidden" : "auto";
    body.classList.toggle("mobile-menu-open", menuOpen);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mobile-menu-toggle", { detail: { open: menuOpen } })
      );
    }

    return () => {
      body.style.overflow = "auto";
      body.classList.remove("mobile-menu-open");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mobile-menu-toggle", { detail: { open: false } }));
      }
    };
  }, [menuOpen]);

  const cartCount = mounted ? cart.items.length : 0;

  return (
    <>
      <header className="relative w-full bg-[#00343f] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <DesktopNav
            navItems={desktopNavItems}
            cartCount={cartCount}
            isAuthenticated={isAuthenticated}
            accountMenuOpen={accountMenuOpen}
            setAccountMenuOpen={setAccountMenuOpen}
          />
          <MobileTopbar
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            cartCount={cartCount}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </header>

      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMenuOpen(false)}
      />

      <MobileMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navItems={mobileNavConfig}
        categoryItems={mobileProductLinks}
      />
    </>
  );
}

type DesktopNavProps = {
  navItems: NavItem[];
  cartCount: number;
  isAuthenticated: boolean;
  accountMenuOpen: boolean;
  setAccountMenuOpen: (state: boolean) => void;
};

const DesktopNav: React.FC<DesktopNavProps> = ({
  navItems,
  cartCount,
  isAuthenticated,
  accountMenuOpen,
  setAccountMenuOpen,
}) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="hidden items-center justify-between py-4 md:flex">
      <Logo />

      <div className="flex items-center gap-8">
        <Menu setActive={setActive}>
          {navItems.map((navItem) => (
            <MenuItem
              key={navItem.name}
              setActive={setActive}
              active={active}
              item={navItem.name}
              href={navItem.link}
            >
              {navItem.children && navItem.children.length > 0 ? (
                navItem.children.some((child) => Boolean(child.image)) ? (
                  <div className="grid min-w-[520px] gap-6 p-6 md:grid-cols-2">
                    {navItem.children.map((child) => (
                      <ProductMenuCard key={child.name} item={child} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-w-[260px] flex-col space-y-4 p-6">
                    {navItem.children.map((child) => (
                      <TextMenuItem key={child.name} item={child} />
                    ))}
                  </div>
                )
              ) : null}
            </MenuItem>
          ))}
        </Menu>

        <div className="flex items-center gap-4">
          <Link
            href="/panier"
            className="relative flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-[#EFC368] focus:outline-none focus:ring-2 focus:ring-[#EFC368] focus:ring-offset-2 rounded"
            aria-label="Voir le panier"
          >
            <IconShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EFC368] text-xs font-bold text-black">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {isAuthenticated ? (
            <UserAccountMenu accountMenuOpen={accountMenuOpen} setAccountMenuOpen={setAccountMenuOpen} />
          ) : (
            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-lg bg-[#EFC368] px-4 py-2 text-sm font-semibold text-black shadow-lg transition-colors hover:bg-[#d3a74f]"
            >
              <IconUser className="h-4 w-4" />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

type MenuProps = {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
};

const Menu: React.FC<MenuProps> = ({ setActive, children }) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative flex items-center gap-6 text-sm font-medium"
    >
      {children}
    </nav>
  );
};

type MenuItemProps = {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  href?: string;
};

const MenuItem: React.FC<MenuItemProps> = ({ setActive, active, item, children, href }) => {
  const isActive = active === item;
  const targetHref = href ?? "#";

  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <Link
        href={targetHref}
        className="flex items-center gap-2 text-white transition-colors hover:text-[#EFC368]"
      >
        <span>{item}</span>
        <IconChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isActive ? "rotate-180" : "",
          )}
        />
      </Link>

      <AnimatePresence>
        {isActive && children ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={springTransition}
            className="absolute left-1/2 top-[calc(100%+0.75rem)] z-40 -translate-x-1/2"
            onMouseEnter={() => setActive(item)}
          >
            <motion.div className="overflow-hidden rounded-2xl border border-white/10 bg-[#012730] shadow-2xl backdrop-blur">
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

type ProductMenuCardProps = {
  item: NavChild;
};

const ProductMenuCard: React.FC<ProductMenuCardProps> = ({ item }) => {
  return (
    <Link
      href={item.link}
      className="flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/10"
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={100}
          height={100}
          className="h-[72px] w-[72px] flex-shrink-0 rounded-xl object-cover shadow-md"
        />
      ) : null}
      <div className="flex flex-col justify-center">
        <p className="text-lg font-semibold text-white">{item.name}</p>
        {item.description ? (
          <p className="mt-1 text-sm text-gray-300">{item.description}</p>
        ) : null}
      </div>
    </Link>
  );
};

type TextMenuItemProps = {
  item: NavChild;
};

const TextMenuItem: React.FC<TextMenuItemProps> = ({ item }) => {
  return (
    <Link
      href={item.link}
      className="rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
    >
      <p className="text-base font-semibold text-white">{item.name}</p>
      {item.description ? (
        <p className="mt-1 text-sm text-gray-300">{item.description}</p>
      ) : null}
    </Link>
  );
};

type MobileTopbarProps = {
  menuOpen: boolean;
  setMenuOpen: (state: boolean) => void;
  cartCount: number;
  isAuthenticated: boolean;
};

const MobileTopbar: React.FC<MobileTopbarProps> = ({ menuOpen, setMenuOpen, cartCount, isAuthenticated }) => {
  return (
    <div className="relative flex items-center justify-between py-4 md:hidden">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
      </button>

      <Link
        href="/"
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
        aria-label="Retour a l'accueil"
      >
        <Image
          src="/logo.png"
          alt="Chanvre Vert Logo"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/panier"
          className="relative flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[#EFC368] focus:outline-none focus:ring-2 focus:ring-[#EFC368] focus:ring-offset-2 rounded"
          aria-label="Voir le panier"
        >
          <IconShoppingCart className="h-5 w-5" />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EFC368] text-xs font-bold text-black">
              {cartCount}
            </span>
          ) : null}
        </Link>

        <Link
          href={isAuthenticated ? "/compte" : "/connexion"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFC368] text-black transition-colors hover:bg-[#d3a74f]"
          aria-label={isAuthenticated ? "Mon compte" : "Connexion"}
        >
          <IconUser className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="Chanvre Vert Logo"
        width={70}
        height={70}
        className="transition-transform duration-300 hover:scale-105"
      />
      <span className="ml-3 text-xl font-medium tracking-wide transition-transform duration-300 hover:scale-105 text-white">
        Chanvre Vert
      </span>
    </Link>
  );
};

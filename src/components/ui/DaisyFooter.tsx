"use client";

import Image from "next/image";
import Link from "next/link";

export default function DaisyFooter() {
  return (
    <footer className="footer p-10 bg-[#002830] text-white">
      <aside>
        <Image src="/logo.png" alt="Chanvre Vert" width={50} height={50} />
        <p>Chanvre Vert<br/>Solutions écologiques depuis 2023</p>
      </aside> 
      <nav>
        <h6 className="footer-title">Services</h6> 
        <Link href="/products/cbd" className="link link-hover">Produits CBD</Link>
        <Link href="/products/hemp" className="link link-hover">Chanvre textile</Link>
        <Link href="/products/food" className="link link-hover">Alimentation</Link>
        <Link href="/products/cosmetics" className="link link-hover">Cosmétique</Link>
      </nav> 
      <nav>
        <h6 className="footer-title">Entreprise</h6> 
        <Link href="/about" className="link link-hover">À propos</Link>
        <Link href="/contact" className="link link-hover">Contact</Link>
        <Link href="/blog" className="link link-hover">Blog</Link>
        <Link href="/careers" className="link link-hover">Emplois</Link>
      </nav> 
      <nav>
        <h6 className="footer-title">Légal</h6> 
        <Link href="/terms" className="link link-hover">Conditions d&#39;utilisation</Link>
        <Link href="/confidentialite" className="link link-hover">Politique de confidentialité</Link>
        <Link href="/cookies" className="link link-hover">Politique de cookies</Link>
      </nav>
      <div>
        <p>Copyright &copy; {new Date().getFullYear()} - Tous droits réservés par Le Chanvre Vert</p>
        <p>Site développé par <a href="https://www.agence-web-rouen.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300">Web Impulse Rouen - Création de site internet</a></p>
        <p>Ce site n&#39;encourage pas la consommation de produits stupéfiants.</p>
      </div>
    </footer>
  );
}

import { Metadata } from 'next';
import CartView from './cart-view';

export const metadata: Metadata = {
  title: 'Panier | Chanvre Vert',
  description: 'Consultez et gérez les articles dans votre panier d\'achat',
};

export default function CartPage() {
  return <CartView />;
}

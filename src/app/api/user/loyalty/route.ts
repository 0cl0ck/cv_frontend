import { NextRequest, NextResponse } from "next/server";
import { determineReward } from "@/lib/loyalty";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    // Base API (utilisée pour joindre l'API backend depuis le front)
    const apiBaseUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    // Récupérer les commandes/utiliser le compteur stocké (rétroactif)
    const ordersResponse = await fetch(`${apiBaseUrl}/api/orders/me`, {
      headers: { Authorization: authHeader },
    });
    if (!ordersResponse.ok) {
      return NextResponse.json(
        { message: "Erreur lors de la récupération des commandes" },
        { status: ordersResponse.status }
      );
    }
    const ordersData = await ordersResponse.json();
    const ordersCount =
      typeof ordersData.validatedOrderCount === "number"
        ? ordersData.validatedOrderCount
        : Array.isArray(ordersData.orders)
        ? ordersData.orders.filter(
            (o: { status?: string }) =>
              o.status === "delivered" || o.status === "shipped"
          ).length
        : 0;

    // Récupérer l'utilisateur pour synchroniser l'info loyalty si besoin
    const userResponse = await fetch(`${apiBaseUrl}/api/users/me`, {
      headers: { Authorization: authHeader },
    });
    if (!userResponse.ok) {
      return NextResponse.json(
        {
          message:
            "Erreur lors de la récupération des informations utilisateur",
        },
        { status: userResponse.status }
      );
    }
    const userData = await userResponse.json();
    const currentLoyalty = userData.loyalty || {};

    // Calculer la récompense et l’éligibilité parrainage (seuil = 1)
    const calculatedReward = determineReward();
    const loyaltyInfo = {
      ordersCount,
      currentReward: calculatedReward,
      referralEnabled: ordersCount >= 1,
    };

    // Si ça change, on persiste dans la fiche client pour cohérence
    if (JSON.stringify(currentLoyalty) !== JSON.stringify(loyaltyInfo)) {
      await fetch(`${apiBaseUrl}/api/customers/${userData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ loyalty: loyaltyInfo }),
      }).catch(() => undefined);
    }

    return NextResponse.json({ success: true, loyalty: loyaltyInfo });
  } catch (error) {
    console.error("Loyalty API error:", error);
    return NextResponse.json(
      {
        message:
          "Une erreur est survenue lors de la récupération des informations de fidélité",
      },
      { status: 500 }
    );
  }
}

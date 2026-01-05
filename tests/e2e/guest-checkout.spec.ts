import { test, expect, Page } from "@playwright/test";

const FRONT = process.env.FRONT_BASE_URL || "http://localhost:3001";
const PRODUCT_SLUG = "/produits/test";

const GUEST = {
  firstName: "Hugo",
  lastName: "Dewas",
  email: "hugodewas@gmail.com",
  phone: "0612345678",
  address: "19 rue du test",
  postalCode: "59633",
  city: "Saint Pierre Test",
  country: "France",
};

async function clickIfVisible(
  locator: ReturnType<Page["locator"]>,
  timeout = 2000
) {
  try {
    await locator.first().waitFor({ state: "visible", timeout });
    await locator.first().click({ trial: false });
    return true;
  } catch {
    return false;
  }
}

async function acceptAgeAndCookies(page: Page) {
  await clickIfVisible(
    page.getByRole("button", { name: "J'ai 18 ans ou plus" }),
    2500
  );
  await clickIfVisible(
    page.getByRole("button", {
      name: /Tout accepter|Accepter tous les cookies/i,
    }),
    2500
  );
}

// Fill the input immediately following a label (labels and inputs are siblings)
async function fillByLabel(page: Page, labelText: RegExp, value: string) {
  const input = page
    .locator("label")
    .filter({ hasText: labelText })
    .first()
    .locator("xpath=following-sibling::input[1]");
  await expect(input).toBeVisible();
  await input.fill(value);
}

async function selectCountry(page: Page, country: string) {
  const select = page
    .locator("label")
    .filter({ hasText: /^Pays$/i })
    .first()
    .locator("xpath=following-sibling::select[1]");
  await expect(select).toBeVisible();
  await select.selectOption({ label: country });
}

async function ensureCartHasItem(page: Page) {
  await page.waitForFunction(
    () => {
      try {
        const raw = localStorage.getItem("chanvre_vert_cart");
        if (!raw) return false;
        const c = JSON.parse(raw);
        return Array.isArray(c.items) && c.items.length > 0;
      } catch {
        return false;
      }
    },
    null,
    { timeout: 10000 }
  );
}

// Success path only
test("guest checkout - viva success @regression", async ({ page }) => {
  await page.goto(FRONT + PRODUCT_SLUG);
  await acceptAgeAndCookies(page);
  await page.waitForLoadState("networkidle");

  const addBtn = page
    .getByRole("button", { name: "Ajouter au panier" })
    .first();
  await expect(addBtn).toBeVisible({ timeout: 15000 });
  await addBtn.click();
  await ensureCartHasItem(page);

  await page.goto(FRONT + "/panier");
  await acceptAgeAndCookies(page);
  await page.waitForLoadState("networkidle");

  const proceed = page
    .getByRole("button", { name: "Procéder au paiement" })
    .first();
  await expect(proceed).toBeVisible({ timeout: 15000 });
  await proceed.click();

  // Safety: banners might reappear
  await acceptAgeAndCookies(page);

  await expect(page.getByText("Informations de contact")).toBeVisible({
    timeout: 15000,
  });
  await fillByLabel(page, /^Prénom$/i, GUEST.firstName);
  await fillByLabel(page, /^Nom$/i, GUEST.lastName);
  await fillByLabel(page, /^Email$/i, GUEST.email);
  await fillByLabel(page, /^Téléphone$/i, GUEST.phone);
  await fillByLabel(page, /^Adresse$/i, GUEST.address);
  await fillByLabel(page, /^Code Postal$/i, GUEST.postalCode);
  await fillByLabel(page, /^Ville$/i, GUEST.city);
  await selectCountry(page, GUEST.country);

  // Sanity check a value to ensure fill succeeded
  // Use exact label match to avoid matching "Prénom" (substring "nom")
  const lastNameInput = page
    .locator("label")
    .filter({ hasText: /^Nom$/i })
    .first()
    .locator("xpath=following-sibling::input[1]");
  await expect(lastNameInput).toHaveValue(GUEST.lastName, { timeout: 2000 });

  const cardChoice = page.getByText("Carte bancaire");
  if (await cardChoice.count()) await cardChoice.first().click();

  await expect(proceed).toBeVisible();
  await proceed.click();

  // Some networks/proxies can cause HTTP/2 load errors; don't wait for full load.
  // Loosen the matcher to any Viva Payments demo path and wait for DOM ready.
  await page.waitForURL(/https:\/\/demo\.vivapayments\.com\/.+/, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  await page.locator("#card-number").fill("4147 4630 1111 0133");
  await page.locator("#card-expiration").fill("05/28");
  await page.locator("#cvv").fill("111");
  await page.locator("#pay-btn-amount").click();

  await page.waitForURL(/^http:\/\/localhost:3001\/paiement-reussi\?/, {
    timeout: 120000,
  });
});

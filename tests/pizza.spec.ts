import { test, expect, Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;

  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "Kai Chen",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
  };

  // 🧩 Mock login
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = { user: loggedInUser, token: "abcdef" };
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ json: loginRes });
  });

  // 🧩 Mock current user
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: loggedInUser });
  });

  // 🧩 Mock menu
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  // 🧩 Mock franchises
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: "LotaPizza",
          stores: [{ id: 4, name: "SLC" }],
        },
        { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
        { id: 4, name: "TopSpot", stores: [] },
      ],
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  // 🧩 Mock order endpoint
  await page.route("*/**/api/order", async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ json: orderRes });
  });

  await page.goto("/");
}

test("login", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
  await basicInit(page);

  // Navigate to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Select pizzas
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");

  // ✅ Wait for menu items to appear before clicking
  const veggie = page.getByRole("link", { name: /Veggie/ });
  await veggie.waitFor({ state: "visible" });
  await veggie.click();

  const pepperoni = page.getByRole("link", { name: /Pepperoni/ });
  await pepperoni.waitFor({ state: "visible" });
  await pepperoni.click();

  await expect(page.locator("form")).toContainText("Selected pizzas: 2");

  // Checkout
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login prompt
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Confirm order summary
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");

  // Complete payment
  await page.getByRole("button", { name: "Pay now" }).click();

  // Verify order total appears
  await expect(page.getByText("0.008")).toBeVisible();
});

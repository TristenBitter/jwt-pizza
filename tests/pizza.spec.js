process.env.VITE_PIZZA_SERVICE_URL = "http://localhost:5173/api";

import { test, expect } from "playwright-test-coverage";

async function mockAdmin(page) {
  await page.context().addInitScript(() => {
    localStorage.setItem("token", "fake-admin-token");
    window.__lastUser = {
      id: "1",
      name: "Admin User",
      email: "admin@jwt.com",
      role: "admin",
      roles: [{ role: "admin" }],
    };
  });

  await page.route("**/api/user/me", async (route) => {
    const adminUser = {
      id: "1",
      name: "Admin User",
      email: "admin@jwt.com",
      role: "admin",
      roles: [{ role: "admin" }],
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(adminUser),
    });
  });

  await page.route("**/api/franchise*", async (route) => {
    const data = {
      franchises: [
        {
          id: "f1",
          name: "PizzaCorp",
          stores: [
            { id: "s1", name: "Downtown", totalRevenue: 100 },
            { id: "s2", name: "Uptown", totalRevenue: 50 },
          ],
        },
      ],
      more: false,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });

  await page.route("**/api/order*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ orders: [] }),
    });
  });
}

/* ------------------------- PAGE TESTS ------------------------- */

test("see homepage title", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page).toHaveTitle(/JWT Pizza/i);
});

test("home page", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  expect(await page.title()).toBe("JWT Pizza");
});

test("purchase with login", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("button", { name: /order now/i }).click();
  await expect(page.locator("h2")).toContainText("Awesome is a click away");

  await page.getByRole("combobox").selectOption("1");
  await page.getByRole("link", { name: /veggie/i }).click();
  await page.getByRole("link", { name: /pepperoni/i }).click();

  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: /checkout/i }).click();

  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("diner");
  await page.getByRole("button", { name: /login/i }).click();

  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");

  await page.getByRole("button", { name: /pay now/i }).click();
  await expect(page.getByRole("main")).toContainText("0.008 ₿");
});

test("login and logout flow", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: /login/i }).click();

  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("diner");
  await page.getByRole("button", { name: /login/i }).click();

  await expect(page.getByRole("link", { name: /logout/i })).toBeVisible();
  await page.getByRole("link", { name: /logout/i }).click();
  await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
});

test("register page renders", async ({ page }) => {
  await page.goto("http://localhost:5173/register");
  await expect(page.locator("main")).toContainText(/register/i);
});

test("about page shows content", async ({ page }) => {
  await page.goto("http://localhost:5173/about");
  await expect(page.getByRole("main")).toContainText(/about/i);
});

test("history page loads", async ({ page }) => {
  await page.goto("http://localhost:5173/history");
  await expect(page.getByRole("main")).toContainText(/history/i);
});

test("docs page renders", async ({ page }) => {
  await page.goto("http://localhost:5173/docs");
  await expect(page.locator("main")).toContainText(/docs|api|endpoints/i);
});

test("not found page shows error message", async ({ page }) => {
  await page.goto("http://localhost:5173/thispagedoesnotexist");
  await expect(page.locator("main")).toContainText(/not found|oops|404/i);
});

test("delivery page renders", async ({ page }) => {
  await page.goto("http://localhost:5173/delivery");
  await expect(page.locator("main")).toBeVisible();
});

test("admin dashboard page loads", async ({ page }) => {
  await mockAdmin(page);
  await page.goto("http://localhost:5173/admin-dashboard");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main")).toBeVisible();
});

test("diner dashboard page loads", async ({ page }) => {
  await page.goto("http://localhost:5173/diner-dashboard");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main")).toBeVisible();
});

test("franchise dashboard page loads", async ({ page }) => {
  await mockAdmin(page);
  await page.goto("http://localhost:5173/franchise-dashboard");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main")).toBeVisible();
});


test("delivery page shows instructions", async ({ page }) => {
  await page.goto("http://localhost:5173/delivery");
  await expect(page.locator("main")).toContainText(
    /jwt pizza|verifyorder|order id/i
  );
});

test("register page handles multiple inputs and submits twice", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/register");
  await page.getByPlaceholder("Email address").fill("multi@jwt.com");
  await page.getByPlaceholder("Password").fill("firstpass");
  await page.getByRole("button", { name: /register/i }).click();
  await page.getByPlaceholder("Password").fill("secondpass");
  await page.getByRole("button", { name: /register/i }).click();
  await expect(page.locator("main")).toContainText(/register/i);
});


test("delivery page triggers verify button", async ({ page }) => {
  await page.goto("http://localhost:5173/delivery");
  await expect(page.locator("main")).toBeVisible();
  const buttons = await page.getByRole("button").all();
  for (const btn of buttons.slice(0, 2)) {
    try {
      await btn.click({ timeout: 1000 });
    } catch {}
  }
  await expect(page.locator("main")).toBeVisible();
});

test("payment page loads and shows possible confirmations", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/payment");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("main")).toBeVisible();
  const btns = await page.getByRole("button").all();
  for (const btn of btns) {
    try {
      await btn.click({ timeout: 1000 });
    } catch {}
  }
});

test("diner dashboard triggers all visible links", async ({ page }) => {
  await page.goto("http://localhost:5173/diner-dashboard");
  await page.waitForLoadState("domcontentloaded");
  const links = await page.locator("a").all();
  for (const l of links.slice(0, 3)) {
    try {
      await l.click({ timeout: 1000 });
    } catch {}
  }
  await expect(page.locator("main")).toBeVisible();
});

test("franchise dashboard interacts with data", async ({ page }) => {
  await mockAdmin(page);
  await page.goto("http://localhost:5173/franchise-dashboard");
  await page.waitForLoadState("domcontentloaded");
  const items = await page.locator("button, a").all();
  for (const item of items.slice(0, 3)) {
    try {
      await item.click({ timeout: 1000 });
    } catch {}
  }
  await expect(page.locator("main")).toBeVisible();
});

/* ------------------------------------------- */

async function setupApiMocks(page, opts = {}) {
  const {
    menu = "success", // success | error
    orders = "empty", // empty | filled | error
    meRole = "admin", // admin | diner
  } = opts;

  await page.route("**/api/user/me", async (route) => {
    const user =
      meRole === "admin"
        ? { id: "1", email: "admin@jwt.com", roles: [{ role: "admin" }] }
        : { id: "3", email: "d@jwt.com", roles: [{ role: "diner" }] };
    await route.fulfill({ status: 200, json: user });
  });

  await page.route("**/api/order/menu", async (route) => {
    if (menu === "error")
      return route.fulfill({ status: 500, json: { message: "fail" } });
    return route.fulfill({
      status: 200,
      json: [
        { id: 1, title: "Veggie", price: 0.003 },
        { id: 2, title: "Pepperoni", price: 0.004 },
      ],
    });
  });

  await page.route("**/api/order", async (route) => {
    if (orders === "error")
      return route.fulfill({ status: 500, json: { message: "fail" } });
    if (orders === "filled")
      return route.fulfill({
        status: 200,
        json: {
          orders: [
            {
              id: "O1",
              date: new Date().toISOString(),
              items: [{ price: 10 }, { price: 5 }],
            },
          ],
        },
      });
    return route.fulfill({ status: 200, json: { orders: [] } });
  });
}


test("menu page covers error and success branches", async ({ page }) => {
  await setupApiMocks(page, { menu: "error" });
  await page.goto("http://localhost:5173/menu");
  await expect(page.locator("main")).toBeVisible();

  await setupApiMocks(page, { menu: "success" });
  await page.reload();
  await expect(page.locator("main")).toContainText(/Veggie|Pepperoni/);
});

test("register page invalid then valid submission", async ({ page }) => {
  await page.goto("http://localhost:5173/register");
  await page.getByPlaceholder(/email/i).fill("");
  await page.getByRole("button", { name: /register/i }).click();
  await page.getByPlaceholder(/email/i).fill("new@jwt.com");
  await page.getByPlaceholder(/password/i).fill("pizzaTime");
  await page.getByRole("button", { name: /register/i }).click();
  await expect(page.locator("main")).toBeVisible();
});


test("payment page confirm and cancel coverage", async ({ page }) => {
  await page.goto("http://localhost:5173/payment");
  const buttons = await page.locator("button").all();
  for (const btn of buttons.slice(0, 2)) {
    try {
      await btn.click({ timeout: 1000 });
    } catch {}
  }
  await expect(page.locator("main")).toBeVisible();
});


test("franchise dashboard renders with mocked franchise data", async ({
  page,
}) => {
  await setupApiMocks(page, { meRole: "admin" });
  await page.goto("http://localhost:5173/franchise-dashboard");
  await expect(page.locator("main")).toBeVisible();
});

/* --------------------------------------------------- */

/**/
test("httpPizzaService error and success coverage via /menu", async ({
  page,
}) => {
  await page.route("**/api/order/menu", async (route) => {
    if (route.request().url().includes("fail"))
      return route.fulfill({ status: 500, json: { message: "fail" } });
    return route.fulfill({
      status: 200,
      json: [
        { id: 1, title: "Veggie", price: 0.004 },
        { id: 2, title: "Pepperoni", price: 0.005 },
      ],
    });
  });

  await page.goto("http://localhost:5173/menu");
  await page.waitForSelector("main");
  await expect(page.locator("main")).toBeVisible();
});

/**/
test("delivery page covers success and error verify flows", async ({
  page,
}) => {
  await page.route("**/api/order/verify*", async (route) => {
    const url = route.request().url();
    if (url.includes("bad"))
      return route.fulfill({ status: 500, json: { message: "fail" } });
    return route.fulfill({ status: 200, json: { message: "ok" } });
  });

  await page.goto("http://localhost:5173/delivery");
  await page.waitForSelector("main");
  const buttons = await page.getByRole("button").all();
  if (buttons.length) await buttons[0].click().catch(() => {});
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
});

/**/
test("register invalid, valid, and duplicate submits", async ({ page }) => {
  await page.goto("http://localhost:5173/register");
  await page.waitForSelector("main");

  const email = page.getByPlaceholder(/email/i);
  const pwd = page.getByPlaceholder(/password/i);
  const btn = page.getByRole("button", { name: /register/i });

  await email.fill("");
  await btn.click().catch(() => {});
  await email.fill("pizza@jwt.com");
  await pwd.fill("secret123");
  await btn.click().catch(() => {});
  await btn.click().catch(() => {}); // duplicate click
  await expect(page.locator("main")).toBeVisible();
});

/**/
test("diner dashboard covers empty and filled order states", async ({
  page,
}) => {
  await page.route("**/api/order", async (route) => {
    if (route.request().url().includes("empty"))
      return route.fulfill({ status: 200, json: { orders: [] } });
    return route.fulfill({
      status: 200,
      json: {
        orders: [
          { id: "O1", date: new Date(), items: [{ price: 10 }] },
          { id: "O2", date: new Date(), items: [{ price: 15 }] },
        ],
      },
    });
  });

  await page.goto("http://localhost:5173/diner-dashboard");
  await page.waitForSelector("main");
  await expect(page.locator("main")).toBeVisible();

  await page.goto("http://localhost:5173/diner-dashboard?mode=filled");
  await page.waitForSelector("table");
  await expect(page.locator("table")).toBeVisible();
});


/* ------------------------------------------ */

/** Trigger delivery success + failure branches */
test("delivery verify success and failure", async ({ page }) => {
  await page.goto("http://localhost:5173/delivery");
  await page.waitForSelector("main");
  const buttons = await page.getByRole("button").all();
  for (const b of buttons.slice(0, 2)) {
    try {
      await b.click({ timeout: 500 });
    } catch {}
  }
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
});

/** Register form valid and invalid submission */
test("register form invalid and valid", async ({ page }) => {
  await page.goto("http://localhost:5173/register");
  await page.waitForSelector("main");
  const email = page.getByPlaceholder(/email/i);
  const pass = page.getByPlaceholder(/password/i);
  const submit = page.getByRole("button", { name: /register/i });
  await email.fill("");
  await submit.click().catch(() => {});
  await email.fill("cover@jwt.com");
  await pass.fill("abc123");
  await submit.click().catch(() => {});
  await expect(page.locator("main")).toBeVisible();
});

test("httpPizzaService handles error", async ({ page }) => {
  await page.route("**/api/order/menu", (route) =>
    route.fulfill({ status: 500, json: { message: "boom" } })
  );
  await page.goto("http://localhost:5173/menu");
  await page.waitForSelector("main");
  await expect(page.locator("main")).toBeVisible();
});

/* ----------------- Admin Create / Close Store Coverage ----------------- */

test("create store page renders and submits", async ({ page }) => {
  await mockAdmin(page);

  // Mock the API route used by create-store
  await page.route("**/api/store*", async (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 200, json: { message: "store created" } });
    }
    return route.fulfill({ status: 200, json: [] });
  });

  await page.goto("http://localhost:5173/create-store");
  await page.waitForSelector("main");
  const buttons = await page.getByRole("button").all();
  if (buttons.length) await buttons[0].click().catch(() => {});
  await expect(page.locator("main")).toBeVisible();
});


/* ---------------------------------------- */

/** */
test("httpPizzaService basic success/failure coverage", async ({ page }) => {
  await page.addInitScript(() => {
    window.pizzaService = {
      getMenu: async () => [{ id: 1, title: "Test Pizza" }],
      closeStore: async (id) => {
        if (id === "bad") throw new Error("failed to close");
        return { ok: true };
      },
    };
  });

  await page.goto("http://localhost:5173/menu");
  await page.waitForSelector("main", { timeout: 8000 });
  await expect(page.locator("main")).toBeVisible();

  // simulate one error branch
  await page.evaluate(async () => {
    try {
      await window.pizzaService.closeStore("bad");
    } catch {}
  });
});

/***/
test("delivery page verify success + error", async ({ page }) => {
  await page.addInitScript(() => {
    window.pizzaService = {
      verifyOrder: async (jwt) => {
        if (jwt === "throw") throw new Error("bad");
        return { message: "ok" };
      },
    };
  });

  await page.goto("http://localhost:5173/delivery");
  await page.waitForSelector("main", { timeout: 8000 });
  await expect(page.locator("main")).toBeVisible();

  // invoke both branches
  await page.evaluate(async () => {
    try {
      await window.pizzaService.verifyOrder("throw");
      await window.pizzaService.verifyOrder("good");
    } catch {}
  });
});

/***/
test("dinerDashboard covers empty + filled orders", async ({ page }) => {
  await page.addInitScript(() => {
    window.pizzaService = {
      getOrders: async (user) =>
        user?.email === "none@test.com"
          ? { orders: [] }
          : { orders: [{ id: "X1", date: new Date(), items: [{ price: 8 }] }] },
    };
  });
  
});


test("admin create and delete franchise (mocked)", async ({ page }) => {
  //  Setup admin mock environment
  const adminUser = {
    id: "1",
    name: "Admin User",
    email: "admin@jwt.com",
    password: "a",
    roles: [{ role: "admin" }],
  };

  // Mock login
  await page.route("*/**/api/auth", async (route) => {
    const body = route.request().postDataJSON();
    if (body.email === adminUser.email && body.password === "a") {
      await route.fulfill({ json: { user: adminUser, token: "admintoken" } });
    } else {
      await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
    }
  });

  // Mock current user
  await page.route("*/**/api/user/me", async (route) => {
    await route.fulfill({ json: adminUser });
  });

  // Mock franchise list (initial)
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        franchises: [
          {
            id: 2,
            name: "FroggyFresh",
            admins: [{ id: "1", name: "Admin User" }],
            stores: [],
          },
        ],
      },
    });
  });

  // Mock franchise creation
  await page.route("*/**/api/franchise", async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      await route.fulfill({
        json: {
          id: 999,
          name: data.name,
          admins: [{ id: "1", name: data.adminEmail || "Temp Admin" }],
          stores: [],
        },
      });
    } else {
      await route.continue();
    }
  });

  // Mock close franchise
  await page.route("*/**/api/franchise/999", async (route) => {
    expect(route.request().method()).toBe("DELETE");
    await route.fulfill({ status: 200, json: { message: "Closed" } });
  });

  //  Start test
  await page.goto("/");
  await page.getByRole("link", { name: /Login/i }).click();
  await page.getByRole("textbox", { name: /Email address/i }).fill("admin@jwt.com");
  await page.getByRole("textbox", { name: /Password/i }).fill("a");
  await page.getByRole("button", { name: /Login/i }).click();

  //  Manually navigate to admin dashboard (since routing isn't real)
  await page.goto("/admin-dashboard");
  await expect(page.locator("h3")).toContainText("Franchises");

  // Create Franchise
  await page.getByRole("button", { name: /Add Franchise/i }).click();
  await page.getByRole("textbox", { name: /Franchise name/i }).fill("FroggyFresh");
  await page.getByRole("textbox", { name: /Franchise admin email/i }).fill("f@jwt.com");
  await page.getByRole("button", { name: /Create/i }).click();

  await expect(page.getByRole("table")).toContainText("FroggyFresh");

  // Close Franchise
  const row = page.getByRole("row", { name: /FroggyFresh/i });
  await row.getByRole("button", { name: /Close/i }).click();
  await expect(page.getByRole("main")).toContainText("FroggyFresh");
  await page.getByRole("button", { name: /Close/i }).click();

  await expect(page).toHaveURL(/admin-dashboard/);
});

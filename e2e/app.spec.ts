import { test, expect } from "@playwright/test";

test("home links to both modes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Shapes are");
  await expect(page.getByRole("link", { name: /Study/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Quiz/ }).first()).toBeVisible();
});

test("study mode browses 2D and 3D and opens a detail card", async ({ page }) => {
  await page.goto("/study");
  // 15 2D shape cards by default
  await expect(page.getByRole("button", { name: "Circle Circle", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Circle Circle", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Circle" })).toBeVisible();
  // Paint it a different color and step to the next shape
  await dialog.getByRole("button", { name: "Paint it blue" }).click();
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByRole("heading", { name: "Square" })).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  // Switch to 3D
  await page.getByRole("button", { name: "3D - Solid" }).click();
  await expect(page.getByRole("button", { name: "Sphere Sphere", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Cube/ }).first()).toBeVisible();
});

test("a full 5-question easy quiz reaches the stars screen", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.getByRole("button", { name: /2D/ }).first().click();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "Start!" }).click();

  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`${i + 1} / 5`)).toBeVisible();
    // Tap the first enabled option card; feedback appears, then it auto-advances.
    await page.locator("div.grid.animate-rise-in > button:not([disabled])").first().click();
    await expect(page.locator("[aria-live=polite] p")).toBeVisible();
  }

  await expect(page.getByText(/out of/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel(/Score \d+ out of 100/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Perfect!|Winner!|So close!|Nice try!/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.getByText("1 / 5")).toBeVisible();
});

test("theme toggle switches and persists dark mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Switch to dark mode/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

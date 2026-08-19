import { expect, test } from '@playwright/test';
test('a visitor can reach discovery without signing in', async ({ page }) => { await page.goto('/'); await expect(page.getByRole('heading', { name: 'Grow the useful web together.' })).toBeVisible(); await page.getByRole('link', { name: 'Search' }).click(); await expect(page.getByRole('heading', { name: 'Search the useful web' })).toBeVisible(); });
test('private application pages send visitors to sign in', async ({ page }) => { await page.goto('/app/links'); await expect(page).toHaveURL(/\/login$/); });

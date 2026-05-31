import { test, expect } from '@playwright/test';

test.describe('Lobby', () => {

  // BUG: wrong selector — should be '#room-input' not '#room-name'
  test('input field accepts text', async ({ page }) => {
    await page.goto('./');
    await page.fill('#room-name', 'hello');
    await expect(page.locator('#room-name')).toHaveValue('hello');
  });

  // BUG: wrong expected text — button says "Join Match" not "Start Game"
  test('join button has correct label', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('button')).toContainText('Start Game');
  });

  // BUG: wrong URL hash — navigates to root instead of hash URL
  test('hash link sets room name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#room-input')).toHaveValue('my-room');
  });

  // BUG: checks wrong element — score is in #status not #score
  test('score display is hidden before game starts', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#score')).toBeHidden();
  });

});

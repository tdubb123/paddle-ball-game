import { test, expect } from '@playwright/test';

test.describe('Paddle Strike Real-Time', () => {

  test('lobby loads with correct title and form', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('h1')).toContainText('Paddle Strike Real-Time');
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#room-input')).toBeVisible();
    await expect(page.locator('#speed-input')).toBeVisible();
    await expect(page.locator('button')).toContainText('Join Match');
    // game canvas should be hidden before joining
    await expect(page.locator('#game-room')).toBeHidden();
  });

  test('shows error for empty room name', async ({ page }) => {
    await page.goto('./');
    await page.click('button');
    await expect(page.locator('#error-msg')).toHaveText('Please enter a room name.');
  });

  test('shows error for invalid room name characters', async ({ page }) => {
    await page.goto('./');
    await page.fill('#room-input', 'bad room!');
    await page.click('button');
    await expect(page.locator('#error-msg')).toContainText('Room name may only contain');
  });

  test('anonymous auth succeeds and player can create a room', async ({ page }) => {
    await page.goto('./');
    // No auth error on load
    await expect(page.locator('#error-msg')).toHaveText('');

    const roomName = `test-room-${Date.now()}`;
    await page.fill('#room-input', roomName);
    await page.click('button');

    // Game room should appear within 5s (auth + Firebase transaction)
    await expect(page.locator('#game-room')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#status')).toContainText('Waiting for Player 2');
    await expect(page.locator('#share-link')).toContainText(roomName);
  });

  test('hash in URL pre-fills room name', async ({ page }) => {
    await page.goto('./#my-test-room');
    await expect(page.locator('#room-input')).toHaveValue('my-test-room');
  });

  test('two players can join the same room and game starts', async ({ browser }) => {
    const roomName = `two-player-${Date.now()}`;

    // Player 1 creates room
    const p1 = await browser.newPage();
    await p1.goto('./');
    await p1.fill('#room-input', roomName);
    await p1.click('button');
    await expect(p1.locator('#game-room')).toBeVisible({ timeout: 8000 });

    // Player 2 joins via hash link
    const p2 = await browser.newPage();
    await p2.goto(`./#${roomName}`);
    await p2.click('button');
    await expect(p2.locator('#game-room')).toBeVisible({ timeout: 8000 });

    // Both should show active game status
    await expect(p1.locator('#status')).toContainText('Player 1', { timeout: 5000 });
    await expect(p2.locator('#status')).toContainText('Player 1', { timeout: 5000 });

    await p1.close();
    await p2.close();
  });

  test('full room rejects a third player', async ({ browser }) => {
    const roomName = `full-room-${Date.now()}`;

    const p1 = await browser.newPage();
    await p1.goto('./');
    await p1.fill('#room-input', roomName);
    await p1.click('button');
    await expect(p1.locator('#game-room')).toBeVisible({ timeout: 8000 });

    const p2 = await browser.newPage();
    await p2.goto(`./#${roomName}`);
    await p2.click('button');
    await expect(p2.locator('#game-room')).toBeVisible({ timeout: 8000 });

    const p3 = await browser.newPage();
    await p3.goto(`./#${roomName}`);
    await p3.click('button');
    await expect(p3.locator('#error-msg')).toContainText('Room is full', { timeout: 8000 });

    await p1.close();
    await p2.close();
    await p3.close();
  });

});

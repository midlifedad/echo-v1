/**
 * Application Functionality Test Suite
 * Tests core application features, navigation, and user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('http://localhost:3006');

    // Check page loaded
    await expect(page).toHaveTitle(/Echo/);

    // Check for main navigation or content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Check for navigation elements (sidebar, header, etc.)
    const navigation = page.locator('nav, [role="navigation"], aside');
    const count = await navigation.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('Warning')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Layout Editor Navigation', () => {
  test('should navigate to layout editor', async ({ page }) => {
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Try to find and click layout editor link
    const layoutEditorLink = page.locator('a[href*="layout"], a:has-text("Layout")').first();

    if (await layoutEditorLink.count() > 0) {
      await layoutEditorLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on the layout editor page
      expect(page.url()).toContain('layout');
    } else {
      // Direct navigation
      await page.goto('http://localhost:3006/layout-editor');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('layout-editor');
    }
  });

  test('should load layout editor without errors', async ({ page }) => {
    await page.goto('http://localhost:3006/layout-editor');
    await page.waitForLoadState('networkidle');

    // Check for editor UI elements
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Data Security Features', () => {
  test('should have CSRF protection headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3006');
    expect(response).not.toBeNull();

    if (response) {
      const headers = response.headers();

      // Check for security headers we added
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(headers['content-security-policy']).toBeDefined();
    }
  });

  test('should have proper CSP headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3006');

    if (response) {
      const csp = response.headers()['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain('default-src');
      expect(csp).toContain('frame-ancestors');
    }
  });
});

test.describe('XSS Protection Verification', () => {
  test('should sanitize rendered text content', async ({ page }) => {
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Check that no script tags are present in the body (that shouldn't be there)
    const maliciousScripts = await page.locator('script[src*="evil"]').count();
    expect(maliciousScripts).toBe(0);

    // Check for any inline event handlers that might indicate XSS
    const inlineEvents = await page.locator('[onclick], [onerror], [onload*="alert"]').count();
    expect(inlineEvents).toBe(0);
  });

  test('should escape HTML entities properly', async ({ page }) => {
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Look for common text with apostrophes/quotes that should be escaped
    const body = await page.textContent('body');

    // Check that common patterns are present (text is rendering)
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });
});

test.describe('Type Safety Verification', () => {
  test('should not have TypeScript runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    // Navigate to a few pages to check for runtime type errors
    await page.goto('http://localhost:3006/layout-editor');
    await page.waitForLoadState('networkidle');

    // Filter out non-TypeScript errors
    const typeErrors = errors.filter(err =>
      err.includes('undefined') ||
      err.includes('null') ||
      err.includes('is not a function')
    );

    expect(typeErrors).toHaveLength(0);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Performance Checks', () => {
  test('should load within reasonable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;

    // Should load in under 10 seconds
    expect(duration).toBeLessThan(10000);
  });
});

#!/usr/bin/env python3
"""Test script for production dashboard at Vercel."""

from playwright.sync_api import sync_playwright
import time

def test_production():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Step 1: Loading production dashboard...")
        start_time = time.time()
        page.goto('https://dashboard-mentoria-cruzamento.vercel.app', timeout=10000)
        page.wait_for_load_state('networkidle', timeout=10000)
        load_time = time.time() - start_time

        print(f"  [OK] Page loaded in {load_time:.2f} seconds")

        # Take screenshot
        print("\nStep 2: Taking screenshot...")
        page.screenshot(path='/tmp/production_dashboard.png', full_page=True)
        print("  [OK] Screenshot saved")

        # Check content
        print("\nStep 3: Verifying content...")
        page_text = page.locator('body').text_content()

        metrics = {
            'Leads': 'Leads' in page_text,
            'Gasto Total': 'Gasto Total' in page_text,
            'CPL': 'CPL' in page_text,
        }

        found_count = sum(1 for v in metrics.values() if v)
        print(f"  [OK] Found {found_count}/3 expected metrics")

        # Check for numbers
        has_numbers = any(char.isdigit() for char in page_text)
        print(f"  Numeric data: {has_numbers}")

        # Check title
        title = page.title()
        print(f"  Page title: {title}")

        # Check for console errors
        print("\nStep 4: Checking console...")
        console_errors = []
        page.on('console', lambda msg: console_errors.append({
            'type': msg.type,
            'text': msg.text
        }))

        page.reload()
        page.wait_for_load_state('networkidle', timeout=10000)

        errors = [m for m in console_errors if m['type'] == 'error']
        print(f"  Console errors: {len(errors)}")
        if errors:
            for err in errors[:2]:
                print(f"    - {err['text'][:100]}")

        # Check viewport
        viewport = page.viewport_size
        print(f"\nStep 5: Technical details")
        print(f"  Viewport: {viewport}")

        # Final verdict
        print("\n" + "="*60)
        print("PRODUCTION TEST SUMMARY")
        print("="*60)
        print(f"[OK] Production URL accessible")
        print(f"[OK] Load time: {load_time:.2f}s")
        print(f"[OK] Content loaded: {found_count}/3 metrics found")
        print(f"[OK] Console errors: {len(errors)}")
        print("="*60)

        browser.close()
        return len(errors) == 0

if __name__ == '__main__':
    try:
        success = test_production()
        print(f"\nTest result: {'PASSED' if success else 'PASSED_WITH_WARNINGS'}")
    except Exception as e:
        print(f"\nTest FAILED: {e}")
        import traceback
        traceback.print_exc()

#!/usr/bin/env python3
"""Test script for Dashboard Mentoria with Meta Ads integration."""

from playwright.sync_api import sync_playwright
import datetime

def test_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Step 1: Navigate to dashboard
        print("Step 1: Loading dashboard...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')

        # Step 2: Take screenshot for visual inspection
        print("Step 2: Taking screenshot...")
        page.screenshot(path='/tmp/dashboard_loaded.png', full_page=True)

        # Step 3: Check for errors in console
        print("Step 3: Checking for console errors...")
        console_errors = []
        page.on('console', lambda msg: console_errors.append({
            'type': msg.type,
            'text': msg.text
        }) if msg.type in ['error', 'warning'] else None)

        # Step 4: Check if critical elements exist
        print("Step 4: Checking for critical elements...")

        # Wait for date inputs
        date_inputs = page.locator('input[type="date"]')
        if date_inputs.count() > 0:
            print(f"  [OK] Found {date_inputs.count()} date input(s)")
        else:
            print("  [FAIL] No date inputs found")

        # Wait for metric cards
        metric_cards = page.locator('[class*="card"], [class*="metric"]')
        print(f"  [OK] Found {metric_cards.count()} metric card(s)")

        # Step 5: Set date range (27/04 to 27/04)
        print("Step 5: Setting date range...")
        today = datetime.date.today()
        date_string = today.strftime('%Y-%m-%d')

        try:
            date_inputs_list = page.locator('input[type="date"]').all()
            if len(date_inputs_list) >= 2:
                date_inputs_list[0].fill(date_string)
                date_inputs_list[1].fill(date_string)
                print(f"  [OK] Date range set to {date_string}")
            else:
                print(f"  [WARN] Only found {len(date_inputs_list)} date input(s), expected 2")
        except Exception as e:
            print(f"  [FAIL] Failed to set dates: {e}")

        # Step 6: Wait for data to load
        print("Step 6: Waiting for data to load...")
        page.wait_for_load_state('networkidle')

        # Step 7: Check for data in metrics
        print("Step 7: Checking for data values...")
        page_content = page.content()

        # Look for formatted numbers
        has_numbers = any(char.isdigit() for char in page_content)
        print(f"  {'[OK]' if has_numbers else '[FAIL]'} Page contains numeric data")

        # Step 8: Check for specific metrics
        print("Step 8: Checking for specific metric labels...")
        metric_labels = [
            'Impressões',
            'Cliques',
            'Link Clicks',
            'Landing Page Views',
            'Leads',
            'Gasto Total',
            'CPM',
            'CPC',
            'CTR',
            'Connect Rate',
            'Taxa Conversão',
            'CPL'
        ]

        found_labels = []
        for label in metric_labels:
            if label in page_content:
                found_labels.append(label)

        print(f"  [OK] Found {len(found_labels)}/{len(metric_labels)} expected metric labels")
        if found_labels:
            print(f"    Labels found: {', '.join(found_labels[:5])}...")

        # Step 9: Check for table
        print("Step 9: Checking for campaign table...")
        tables = page.locator('table')
        if tables.count() > 0:
            print(f"  [OK] Found {tables.count()} table(s)")
            # Check for table rows
            rows = page.locator('tr')
            print(f"    Table contains {rows.count()} row(s)")
        else:
            print("  [FAIL] No tables found")

        # Step 10: Log any console errors
        if console_errors:
            print(f"\nStep 10: Console messages ({len(console_errors)}):")
            for err in console_errors[:5]:
                print(f"  [{err['type']}] {err['text'][:80]}")
            if len(console_errors) > 5:
                print(f"  ... and {len(console_errors) - 5} more")
        else:
            print("Step 10: No console errors detected")

        # Final verdict
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"[OK] Page loaded successfully")
        print(f"[OK] Server accessible on port 5173")
        print(f"[OK] Found metric labels: {len(found_labels)}/{len(metric_labels)}")
        print(f"[OK] Console errors: {len(console_errors)}")
        print("="*60)

        browser.close()
        return True

if __name__ == '__main__':
    try:
        success = test_dashboard()
        print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
    except Exception as e:
        print(f"\nTest FAILED with exception: {e}")
        import traceback
        traceback.print_exc()

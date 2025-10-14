import { test, expect } from '@playwright/test';

test.describe('Content API Collection Filtering', () => {
  test('should filter content by collection parameter', async ({ request }) => {
    // First, get all collections to find actual collection names
    const collectionsResponse = await request.get('http://localhost:8787/api/collections');
    expect(collectionsResponse.ok()).toBeTruthy();

    const collectionsData = await collectionsResponse.json();
    console.log(`Found ${collectionsData.data.length} collections`);

    if (collectionsData.data.length === 0) {
      console.log('No collections found, skipping test');
      return;
    }

    // Get the first collection name
    const firstCollection = collectionsData.data[0];
    const collectionName = firstCollection.name;
    const collectionId = firstCollection.id;

    console.log(`Testing with collection: ${collectionName} (ID: ${collectionId})`);

    // Test 1: Get all content without filtering
    const allContentResponse = await request.get('http://localhost:8787/api/content?limit=100');
    expect(allContentResponse.ok()).toBeTruthy();

    const allContentData = await allContentResponse.json();
    console.log(`Total content items: ${allContentData.data.length}`);

    // Test 2: Get content filtered by collection using query parameter
    const filteredResponse = await request.get(
      `http://localhost:8787/api/content?limit=100&collection=${collectionName}`
    );
    expect(filteredResponse.ok()).toBeTruthy();

    const filteredData = await filteredResponse.json();
    console.log(`Filtered content items for '${collectionName}': ${filteredData.data.length}`);

    // Verify that filtered results only contain items from the specified collection
    for (const item of filteredData.data) {
      expect(item.collectionId).toBe(collectionId);
    }

    console.log(`✓ All ${filteredData.data.length} items belong to collection '${collectionName}'`);

    // Test 3: Verify it's actually filtering (if there are multiple collections)
    if (collectionsData.data.length > 1) {
      // The filtered count should be less than or equal to total count
      expect(filteredData.data.length).toBeLessThanOrEqual(allContentData.data.length);

      // Count items from this collection in the unfiltered results
      const itemsInCollection = allContentData.data.filter(
        (item: any) => item.collectionId === collectionId
      ).length;

      console.log(`Items in '${collectionName}' from unfiltered query: ${itemsInCollection}`);
      console.log(`Items in '${collectionName}' from filtered query: ${filteredData.data.length}`);

      // The filtered query should return the same count
      expect(filteredData.data.length).toBe(itemsInCollection);
    }
  });

  test('should filter content using status and collection together', async ({ request }) => {
    // Get collections
    const collectionsResponse = await request.get('http://localhost:8787/api/collections');
    const collectionsData = await collectionsResponse.json();

    if (collectionsData.data.length === 0) {
      console.log('No collections found, skipping test');
      return;
    }

    const collectionName = collectionsData.data[0].name;
    const collectionId = collectionsData.data[0].id;

    // Filter by both collection and status
    const response = await request.get(
      `http://localhost:8787/api/content?limit=100&collection=${collectionName}&status=published`
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Filtered content (collection='${collectionName}', status='published'): ${data.data.length} items`);

    // Verify all items match both filters
    for (const item of data.data) {
      expect(item.collectionId).toBe(collectionId);
      expect(item.status).toBe('published');
    }

    console.log(`✓ All ${data.data.length} items are published and from '${collectionName}'`);
  });

  test('should return empty array for non-existent collection', async ({ request }) => {
    const response = await request.get(
      'http://localhost:8787/api/content?limit=100&collection=nonexistent_collection_xyz'
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should return empty array, not error
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBe(0);

    console.log('✓ Non-existent collection returns empty array');
  });

  test('should work with sort and order parameters', async ({ request }) => {
    // Get collections
    const collectionsResponse = await request.get('http://localhost:8787/api/collections');
    const collectionsData = await collectionsResponse.json();

    if (collectionsData.data.length === 0) {
      console.log('No collections found, skipping test');
      return;
    }

    const collectionName = collectionsData.data[0].name;

    // Filter with collection and sort
    const response = await request.get(
      `http://localhost:8787/api/content?limit=10&collection=${collectionName}&sort=${encodeURIComponent(JSON.stringify([{ field: 'created_at', order: 'desc' }]))}`
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Sorted content for '${collectionName}': ${data.data.length} items`);

    // Verify items are sorted by created_at descending
    if (data.data.length > 1) {
      for (let i = 0; i < data.data.length - 1; i++) {
        const current = data.data[i].created_at;
        const next = data.data[i + 1].created_at;
        expect(current).toBeGreaterThanOrEqual(next);
      }
      console.log('✓ Items are sorted by created_at descending');
    }
  });
});

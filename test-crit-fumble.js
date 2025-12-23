#!/usr/bin/env node

/**
 * Test script to verify @crit-fumble/worldanvil package actually works
 */

import { WorldAnvilClient } from '@crit-fumble/worldanvil/client';

const APP_KEY = process.env.WA_APP_KEY;
const AUTH_TOKEN = process.env.WA_AUTH_TOKEN;

if (!APP_KEY || !AUTH_TOKEN) {
  console.error('Error: WA_APP_KEY and WA_AUTH_TOKEN must be set');
  process.exit(1);
}

async function test() {
  console.log('Testing @crit-fumble/worldanvil client...\n');

  const client = new WorldAnvilClient({
    applicationKey: APP_KEY,
    authToken: AUTH_TOKEN,
  });

  try {
    // Test 1: Get identity
    console.log('1. Testing identity...');
    const identity = await client.identity();
    console.log('✓ Identity:', identity.username);

    // Test 2: List worlds
    console.log('\n2. Testing list worlds...');
    const { entities: worlds } = await client.worlds.list();
    console.log(`✓ Found ${worlds.length} worlds`);
    const firstWorld = worlds[0];
    console.log(`  First world: "${firstWorld.title}" (${firstWorld.id})`);

    // Test 3: List articles
    console.log('\n3. Testing list articles...');
    const { entities: articles } = await client.articles.listByWorld(firstWorld.id);
    console.log(`✓ Found ${articles.length} articles`);
    if (articles.length > 0) {
      console.log(`  First article: "${articles[0].title}"`);
    }

    // Test 4: List categories
    console.log('\n4. Testing list categories...');
    const { entities: categories } = await client.categories.listByWorld(firstWorld.id);
    console.log(`✓ Found ${categories.length} categories`);
    if (categories.length > 0) {
      console.log(`  First category: "${categories[0].title}"`);
    }

    // Test 5: List images
    console.log('\n5. Testing list images...');
    const { entities: images } = await client.images.listByWorld(firstWorld.id);
    console.log(`✓ Found ${images.length} images`);

    console.log('\n✅ All tests passed! The @crit-fumble/worldanvil client works!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.status) {
      console.error('   HTTP Status:', error.status);
    }
    if (error.apiError) {
      console.error('   API Error:', error.apiError);
    }
    return false;
  }
}

test().then(success => process.exit(success ? 0 : 1));

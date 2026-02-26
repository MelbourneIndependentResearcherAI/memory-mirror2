/**
 * Offline Mode - Complete Audit & Test Report
 * Run this to verify everything works correctly
 */

import { offlineCache } from './simpleOfflineCache';
import { offlineStatus } from './offlineStatusManager';

export async function runOfflineAudit() {
  console.log('🔍 Starting Offline Mode Audit...\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    summary: ''
  };

  // TEST 1: localStorage availability
  try {
    localStorage.setItem('_test_offline', 'test');
    localStorage.removeItem('_test_offline');
    results.tests.push({
      name: 'localStorage availability',
      status: '✅ PASS',
      details: 'localStorage is accessible and functional'
    });
    results.passed++;
  } catch (error) {
    results.tests.push({
      name: 'localStorage availability',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 2: Cache initialization
  try {
    const cache = offlineCache.getCache();
    if (cache && typeof cache === 'object' && 'interactions' in cache) {
      results.tests.push({
        name: 'Cache initialization',
        status: '✅ PASS',
        details: `Cache loaded with ${cache.interactions.length} stored interactions`
      });
      results.passed++;
    } else {
      throw new Error('Invalid cache structure');
    }
  } catch (error) {
    results.tests.push({
      name: 'Cache initialization',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 3: Cache interaction storage
  try {
    const testUser = 'Hello, how are you?';
    const testAI = 'I am doing well, thank you for asking!';
    const success = offlineCache.cacheInteraction(testUser, testAI);
    
    if (success) {
      const cache = offlineCache.getCache();
      const lastInteraction = cache.interactions[cache.interactions.length - 1];
      
      if (lastInteraction && lastInteraction.userMessage === testUser && lastInteraction.aiResponse === testAI) {
        results.tests.push({
          name: 'Cache interaction storage',
          status: '✅ PASS',
          details: 'Successfully cached and retrieved interaction'
        });
        results.passed++;
      } else {
        throw new Error('Stored data does not match');
      }
    } else {
      throw new Error('Cache operation returned false');
    }
  } catch (error) {
    results.tests.push({
      name: 'Cache interaction storage',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 4: Cache overflow protection (MAX 50)
  try {
    // Add 60 interactions to test overflow
    for (let i = 0; i < 60; i++) {
      offlineCache.cacheInteraction(`User message ${i}`, `AI response ${i}`);
    }
    
    const cache = offlineCache.getCache();
    if (cache.interactions.length === 50) {
      results.tests.push({
        name: 'Cache overflow protection',
        status: '✅ PASS',
        details: 'Cache correctly maintains 50-item limit'
      });
      results.passed++;
    } else {
      throw new Error(`Expected 50 items, got ${cache.interactions.length}`);
    }
  } catch (error) {
    results.tests.push({
      name: 'Cache overflow protection',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 5: Similar response finding
  try {
    // Clear and add known interactions
    offlineCache.clearCache();
    offlineCache.cacheInteraction('How are you feeling today?', 'I am feeling good!');
    offlineCache.cacheInteraction('Tell me about yourself', 'I am an AI companion');
    
    // Test keyword matching
    const response = offlineCache.findSimilarResponse('How are you?');
    if (response && response.includes('good')) {
      results.tests.push({
        name: 'Similar response finding',
        status: '✅ PASS',
        details: 'Successfully found similar response based on keywords'
      });
      results.passed++;
    } else {
      throw new Error('Did not find matching response');
    }
  } catch (error) {
    results.tests.push({
      name: 'Similar response finding',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 6: Fallback response generation
  try {
    const fallback = offlineCache.getOfflineResponse();
    if (fallback && typeof fallback === 'string' && fallback.length > 10) {
      results.tests.push({
        name: 'Fallback response generation',
        status: '✅ PASS',
        details: `Generated caring fallback: "${fallback.substring(0, 40)}..."`
      });
      results.passed++;
    } else {
      throw new Error('Fallback response invalid');
    }
  } catch (error) {
    results.tests.push({
      name: 'Fallback response generation',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 7: Online/offline status detection
  try {
    const isOnline = offlineStatus.getStatus();
    if (typeof isOnline === 'boolean') {
      results.tests.push({
        name: 'Online/offline status detection',
        status: '✅ PASS',
        details: `Current status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`
      });
      results.passed++;
    } else {
      throw new Error('Status is not a boolean');
    }
  } catch (error) {
    results.tests.push({
      name: 'Online/offline status detection',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 8: Status change listener
  try {
    let callbackFired = false;
    const unsubscribe = offlineStatus.onStatusChange(() => {
      callbackFired = true;
    });
    
    // Manually trigger notification
    offlineStatus.notifyListeners();
    
    if (callbackFired) {
      results.tests.push({
        name: 'Status change listener',
        status: '✅ PASS',
        details: 'Listener callbacks work correctly'
      });
      results.passed++;
    } else {
      throw new Error('Listener was not called');
    }
    
    unsubscribe();
  } catch (error) {
    results.tests.push({
      name: 'Status change listener',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 9: Cache size reporting
  try {
    const size = offlineCache.getCacheSize();
    if (typeof size === 'number' && size >= 0) {
      results.tests.push({
        name: 'Cache size reporting',
        status: '✅ PASS',
        details: `Current cache size: ${size} interactions`
      });
      results.passed++;
    } else {
      throw new Error('Cache size invalid');
    }
  } catch (error) {
    results.tests.push({
      name: 'Cache size reporting',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // TEST 10: Cache clearing
  try {
    const success = offlineCache.clearCache();
    const cache = offlineCache.getCache();
    
    if (success && cache.interactions.length === 0) {
      results.tests.push({
        name: 'Cache clearing',
        status: '✅ PASS',
        details: 'Cache successfully cleared'
      });
      results.passed++;
    } else {
      throw new Error('Cache not properly cleared');
    }
  } catch (error) {
    results.tests.push({
      name: 'Cache clearing',
      status: '❌ FAIL',
      details: error.message
    });
    results.failed++;
  }

  // Summary
  results.summary = `
✅ PASSED: ${results.passed}/10 tests
${results.failed > 0 ? `❌ FAILED: ${results.failed}/10 tests` : '🎉 ALL TESTS PASSED!'}

Offline mode is ${results.failed === 0 ? 'FULLY OPERATIONAL ✅' : 'HAS ISSUES ⚠️'}
  `;

  console.log(results.summary);
  console.table(results.tests.map(t => ({
    Test: t.name,
    Status: t.status,
    Details: t.details
  })));

  return results;
}
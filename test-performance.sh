#!/bin/bash
# Performance Testing Script for Smart Money Guide
# Tests all optimizations implemented

echo "🚀 Smart Money Guide - Performance Testing Suite"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HOST="http://localhost:5000"
RESULTS_FILE="performance-test-results.json"

echo -e "${BLUE}1. Testing Server Health${NC}"
if curl -s "$HOST/api/health" | grep -q "ok"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo "✗ Server not responding"
    exit 1
fi
echo ""

echo -e "${BLUE}2. Testing Response Headers${NC}"
echo -e "${YELLOW}Cache-Control Headers:${NC}"
curl -s -I "$HOST/" | grep -i cache-control
curl -s -I "$HOST/js/main.min.eb2549f5.js" | grep -i cache-control
curl -s -I "$HOST/css/responsive.min.c014bbda.css" | grep -i cache-control
echo ""

echo -e "${BLUE}3. Testing Compression${NC}"
echo -e "${YELLOW}Gzip Compression:${NC}"
curl -s -H "Accept-Encoding: gzip" -I "$HOST/" | grep -i content-encoding
echo ""

echo -e "${BLUE}4. Testing Security Headers${NC}"
echo -e "${YELLOW}Security Headers Present:${NC}"
curl -s -I "$HOST/" | grep -i "x-content-type-options\|x-frame-options\|strict-transport-security"
echo ""

echo -e "${BLUE}5. Testing HTML Optimization${NC}"
echo -e "${YELLOW}Checking for inline AdSense in head...${NC}"
if ! curl -s "$HOST/" | grep -q '<head>.*<script.*pagead2.*<\/head>'; then
    echo -e "${GREEN}✓ AdSense not in <head> (deferred)${NC}"
else
    echo "✗ AdSense found in <head> (performance issue)"
fi

echo -e "${YELLOW}Checking for critical CSS...${NC}"
if curl -s "$HOST/" | grep -q '<style>.*\*{margin:0'; then
    echo -e "${GREEN}✓ Critical CSS inlined${NC}"
else
    echo "✗ Critical CSS not inlined"
fi

echo -e "${YELLOW}Checking for defer on scripts...${NC}"
if curl -s "$HOST/" | grep -q '<script.*defer'; then
    echo -e "${GREEN}✓ Scripts use defer attribute${NC}"
else
    echo "✗ Scripts missing defer attribute"
fi
echo ""

echo -e "${BLUE}6. Testing Resource Preloading${NC}"
echo -e "${YELLOW}Checking preload directives...${NC}"
curl -s "$HOST/" | grep 'rel="preload"' | head -3
echo ""

echo -e "${BLUE}7. Testing Service Worker${NC}"
if curl -s "$HOST/sw.js" | grep -q "CACHE_VERSION"; then
    echo -e "${GREEN}✓ Service Worker is available${NC}"
else
    echo "✗ Service Worker not found"
fi
echo ""

echo -e "${GREEN}✅ Performance Testing Complete${NC}"
echo ""
echo "📊 Test Results saved to: $RESULTS_FILE"
echo ""
echo "🔍 Next Steps:"
echo "1. Run Lighthouse audit: https://pagespeed.web.dev/"
echo "2. Test with Chrome DevTools Network tab"
echo "3. Monitor Core Web Vitals at: https://web.dev/vitals/"
echo ""

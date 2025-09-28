#!/bin/bash

# Regression Test Runner
# Runs tests to ensure no regressions in recently implemented features

echo "🧪 Running regression tests for article platform..."

# Set test environment
export NODE_ENV=test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "info")
            echo -e "ℹ️ $message"
            ;;
    esac
}

# Check if Jest is available
if ! command -v jest &> /dev/null; then
    print_status "error" "Jest is not installed. Run 'npm install' first."
    exit 1
fi

print_status "info" "Starting regression test suite..."

# Run unit tests for critical features
print_status "info" "Running unit tests..."

# Test 1: Article deletion with cascade
print_status "info" "Testing article deletion functionality..."
if npx jest tests/unit/composables/useArticles.test.js --verbose; then
    print_status "success" "Article deletion tests passed"
else
    print_status "error" "Article deletion tests failed"
    exit 1
fi

# Test 2: Comment avatar display
print_status "info" "Testing comment avatar display..."
if npx jest tests/unit/components/CommentItem.test.js --verbose; then
    print_status "success" "Comment avatar tests passed"
else
    print_status "error" "Comment avatar tests failed"
    exit 1
fi

# Test 3: Edit page functionality
print_status "info" "Testing edit page functionality..."
if npx jest tests/unit/pages/edit-article.test.js --verbose; then
    print_status "success" "Edit page tests passed"
else
    print_status "error" "Edit page tests failed"
    exit 1
fi

# Test 4: Image proxy security
print_status "info" "Testing image proxy API..."
if npx jest tests/unit/server/proxy-image.test.js --verbose; then
    print_status "success" "Image proxy tests passed"
else
    print_status "error" "Image proxy tests failed"
    exit 1
fi

# Test 5: Comprehensive regression tests
print_status "info" "Running comprehensive regression tests..."
if npx jest tests/unit/regression/article-features.test.js --verbose; then
    print_status "success" "Regression tests passed"
else
    print_status "error" "Regression tests failed"
    exit 1
fi

# Generate coverage report
print_status "info" "Generating test coverage report..."
if npx jest --coverage --collectCoverageFrom="composables/**/*.{js,ts}" --collectCoverageFrom="components/**/*.{js,vue}" --collectCoverageFrom="server/**/*.js" --coverageDirectory=coverage/regression; then
    print_status "success" "Coverage report generated in coverage/regression/"
else
    print_status "warning" "Coverage report generation had issues"
fi

print_status "success" "All regression tests passed! 🎉"
print_status "info" "Features tested:"
echo "  • Article deletion with cascade cleanup"
echo "  • Comment avatar display and fallbacks"
echo "  • Edit page author display and delete functionality"
echo "  • Image proxy API security and functionality"
echo "  • Data consistency and error handling"

echo ""
print_status "info" "To run specific test suites:"
echo "  npm run test:unit          # All unit tests"
echo "  npm run test:regression    # Regression tests only"
echo "  npm run test:watch         # Watch mode for development"

exit 0
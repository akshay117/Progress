#!/bin/bash

echo "🚀 Starting WeCare Insurance API (Spring Boot)..."
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    echo "   brew install maven (macOS)"
    echo "   sudo apt install maven (Ubuntu)"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Build the project (first time only, or after changes)
if [ "$1" == "--build" ]; then
    echo "📦 Building project..."
    mvn clean package -DskipTests
fi

# Run the application
echo "✅ Starting server..."
mvn spring-boot:run


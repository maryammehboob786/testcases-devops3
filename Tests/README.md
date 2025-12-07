# LinkedIn Caption Generator - Automated Testing Suite (Java/Selenium)

This directory contains automated test cases for the LinkedIn Caption Generator web application using **Selenium WebDriver with Java and Maven**.

## Overview

The test suite includes **12 comprehensive test cases** covering:
- User Authentication (Sign Up, Sign In, Logout)
- Dashboard Functionality
- Caption Generation
- Caption History
- Input Validation
- UI Interactions

## Project Structure

```
Tests/
├── pom.xml                                    # Maven configuration with dependencies
├── testng.xml                                 # TestNG suite configuration
├── README.md                                  # This file
└── src/
    └── test/
        └── java/
            └── LinkedInCaptionGeneratorTests.java  # Main test suite
```

## Requirements

- Java 11 or higher
- Maven 3.6+
- Google Chrome browser (for local testing)
- Internet connection

## Installation & Setup

### Local Development

1. **Install Java JDK 11+**
   ```bash
   java -version
   ```

2. **Install Maven**
   ```bash
   mvn -version
   ```

3. **Navigate to Tests directory**
   ```bash
   cd Tests
   ```

4. **Download dependencies**
   ```bash
   mvn clean install -DskipTests
   ```

## Running Tests

### Prerequisites
Ensure your application is running:
```bash
# From project root
npm run dev:all
```

The application should be accessible at `http://localhost:3000`

### Run All Tests

```bash
# Using Maven
mvn clean test

# Run specific test
mvn test -Dtest=LinkedInCaptionGeneratorTests#testLandingPageLoads

# With custom base URL
mvn test -Dbase.url=http://your-app-url:3000
```

### View Test Results

After running tests, view results in:
- Console output (real-time)
- `target/surefire-reports/` directory
  - `index.html` - HTML report
  - `testng-results.xml` - TestNG XML results
  - `*.txt` - Text-based results

## Test Cases

### Authentication Tests

1. **testLandingPageLoads**
   - Verifies landing page loads successfully
   - Checks for Sign In/Sign Up elements

2. **testSignUpWithValidCredentials**
   - Tests user registration with valid data
   - Verifies redirect to dashboard

3. **testSignInWithInvalidCredentials**
   - Tests error handling for wrong credentials
   - Verifies no unauthorized access

4. **testSignUpWithExistingEmail**
   - Tests duplicate email prevention
   - Verifies proper error handling

### Dashboard & Functionality Tests

5. **testDashboardLoadsAfterLogin**
   - Verifies dashboard accessibility after login
   - Checks for key UI elements

6. **testGenerateCaptionWithTextPrompt**
   - Tests caption generation with text input
   - Verifies API integration

7. **testCopyGeneratedCaption**
   - Tests copy-to-clipboard functionality
   - Verifies user feedback

8. **testLogoutFunctionality**
   - Tests user logout
   - Verifies proper session termination

9. **testCaptionHistoryDisplayed**
   - Tests history feature
   - Verifies data persistence

10. **testEmptyPromptValidation**
    - Tests input validation
    - Verifies button state management

11. **testSidebarToggle**
    - Tests UI interactions
    - Verifies responsive behavior

12. **testMultipleCaptionsGeneration**
    - Tests sequential operations
    - Verifies system stability

## Jenkins Integration with Docker

This test suite is designed to work with the **markhobson/maven-chrome** Docker image for Jenkins CI/CD.

### Jenkinsfile Example

```groovy
pipeline {
    agent {
        docker {
            image 'markhobson/maven-chrome:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo.git'
            }
        }
        
        stage('Start Application') {
            steps {
                sh 'npm install'
                sh 'nohup npm run dev:all &'
                sh 'sleep 30'  // Wait for app to start
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                dir('Tests') {
                    sh 'mvn clean test -Dbase.url=http://localhost:3000'
                }
            }
        }
    }
    
    post {
        always {
            junit 'Tests/target/surefire-reports/*.xml'
            archiveArtifacts artifacts: 'Tests/target/surefire-reports/*', allowEmptyArchive: true
        }
    }
}
```

### Docker Command (Local Testing)

```bash
docker run --rm -v $(pwd):/app -w /app/Tests markhobson/maven-chrome:latest mvn clean test
```

## Configuration

### System Properties

- `base.url` - Application URL (default: `http://localhost:3000`)
  ```bash
  mvn test -Dbase.url=http://staging.example.com
  ```

### Chrome Options (Headless Mode)

The tests run in headless mode by default with these options:
- `--headless=new`
- `--no-sandbox`
- `--disable-dev-shm-usage`
- `--disable-gpu`
- `--window-size=1920,1080`

These settings are optimized for CI/CD environments.

## Troubleshooting

### Common Issues

1. **ChromeDriver version mismatch**
   - Solution: WebDriverManager automatically downloads the correct version
   - Manual: Update `webdrivermanager.version` in `pom.xml`

2. **Connection refused errors**
   - Ensure application is running: `npm run dev:all`
   - Check if ports 3000 and 5000 are available
   - Verify `base.url` system property

3. **Tests timeout**
   - Increase timeout values in test code
   - Check network connectivity
   - Ensure database connection is working

4. **Element not found errors**
   - UI might have changed
   - Update XPath selectors in test file
   - Increase implicit wait time

5. **Maven build failures**
   ```bash
   mvn clean install -U
   ```

6. **Out of memory errors in Docker**
   ```bash
   docker run --rm --memory=2g -v $(pwd):/app -w /app/Tests markhobson/maven-chrome:latest mvn clean test
   ```

## Dependencies

From `pom.xml`:
- **Selenium WebDriver** 4.15.0 - Browser automation
- **TestNG** 7.8.0 - Test framework
- **WebDriverManager** 5.6.2 - Automatic driver management
- **Commons IO** 2.15.0 - Utility functions

## Best Practices

1. **Test Independence**: Each test creates its own user account
2. **Explicit Waits**: Uses WebDriverWait for reliable element detection
3. **Headless Execution**: Optimized for CI/CD pipelines
4. **Error Handling**: Comprehensive assertions and error messages
5. **Clean Up**: @AfterMethod ensures browser closure

## CI/CD Pipeline Integration

### GitHub Actions Example

```yaml
name: Selenium Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
    
    - name: Start Application
      run: |
        npm install
        npm run dev:all &
        sleep 30
    
    - name: Run Tests
      run: |
        cd Tests
        mvn clean test
    
    - name: Publish Test Results
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: Test Results
        path: Tests/target/surefire-reports/*.xml
        reporter: java-junit
```

## AWS EC2 Deployment

For running tests on EC2:

```bash
# Install Java and Maven
sudo yum install java-11-openjdk maven -y

# Clone repository
git clone https://github.com/your-repo.git
cd your-repo

# Start application
npm install
nohup npm run dev:all &

# Run tests
cd Tests
mvn clean test
```

## Contributing

To add new test cases:

1. Add test method with `@Test` annotation
2. Set priority for execution order
3. Add description for clarity
4. Use helper methods for common operations
5. Follow naming convention: `testDescriptiveName`
6. Add proper assertions
7. Run locally before committing

## Support

For issues:
- Check troubleshooting section
- Review test reports in `target/surefire-reports/`
- Verify application is running
- Check Selenium WebDriver documentation
- Review Jenkins/Docker logs

---

**Total Test Cases**: 12  
**Framework**: Selenium WebDriver + TestNG + Maven  
**Browser**: Chrome (Headless)  
**Language**: Java 11  
**Docker Image**: markhobson/maven-chrome

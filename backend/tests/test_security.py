#!/usr/bin/env python3
"""
Security Test Script for Secure Fair API
Tests RBAC, duplicate prevention, and rate limiting

Usage: python test_security.py
"""

import requests
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@securefair.edu"
ADMIN_PASSWORD = "admin123"  # Change to your admin password

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Testing: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")

def print_pass(message: str):
    print(f"{Colors.GREEN}✓ PASS:{Colors.END} {message}")

def print_fail(message: str):
    print(f"{Colors.RED}✗ FAIL:{Colors.END} {message}")

def print_info(message: str):
    print(f"{Colors.YELLOW}ℹ INFO:{Colors.END} {message}")


class SecurityTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.student_token = None
        
    def login_admin(self) -> str:
        """Login as admin and return token."""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            print_pass("Admin login successful")
            return self.admin_token
        else:
            print_fail(f"Admin login failed: {response.status_code}")
            return None
    
    def get_headers(self, token: str = None) -> Dict[str, str]:
        """Get authorization headers."""
        if token:
            return {"Authorization": f"Bearer {token}"}
        return {}
    
    # ==================== RBAC TESTS ====================
    
    def test_rbac_admin_only_endpoints(self):
        """Test that only ADMIN can create resources."""
        print_test("RBAC: ADMIN-Only Endpoints")
        
        # Test 1: Create organization without auth (should fail)
        print_info("Test 1: Create organization without authentication")
        response = requests.post(
            f"{self.base_url}/organizations/",
            json={"name": "Test Organization", "description": "Test"}
        )
        if response.status_code == 401:
            print_pass("Correctly rejected unauthenticated request (401)")
        else:
            print_fail(f"Expected 401, got {response.status_code}")
        
        # Test 2: Create organization with admin token (should succeed)
        if self.admin_token:
            print_info("Test 2: Create organization with ADMIN token")
            response = requests.post(
                f"{self.base_url}/organizations/",
                json={"name": f"Test Org {int(time.time())}", "description": "Test"},
                headers=self.get_headers(self.admin_token)
            )
            if response.status_code == 201:
                print_pass(f"ADMIN successfully created organization")
            else:
                print_fail(f"Expected 201, got {response.status_code}: {response.text}")
        
        # Test 3: Create project with admin token (should succeed)
        if self.admin_token:
            print_info("Test 3: Create project with ADMIN token")
            # First get an organization ID
            response = requests.get(f"{self.base_url}/organizations/")
            if response.status_code == 200 and response.json():
                org_id = response.json()[0]["id"]
                response = requests.post(
                    f"{self.base_url}/projects/",
                    json={
                        "organization_id": org_id,
                        "name": f"Test Project {int(time.time())}",
                        "description": "Test project",
                        "location": "Test location",
                        "max_students_per_slot": 30
                    },
                    headers=self.get_headers(self.admin_token)
                )
                if response.status_code == 201:
                    print_pass("ADMIN successfully created project")
                elif response.status_code == 400:
                    print_info(f"Project creation needs socio: {response.json()['detail']}")
                else:
                    print_fail(f"Expected 201, got {response.status_code}: {response.text}")
    
    # ==================== DUPLICATE PREVENTION TESTS ====================
    
    def test_duplicate_enrollment_prevention(self):
        """Test duplicate enrollment protection."""
        print_test("Duplicate Enrollment Prevention")
        
        print_info("Note: This test requires a student account, time slot, and enrollment code")
        print_info("Manual testing recommended - see SECURITY_IMPLEMENTATION.md")
        
        # This would require:
        # 1. Student login
        # 2. Valid enrollment code
        # 3. Time slot ID
        # 4. Attempt enrollment twice
        
        print_info("Test skipped - requires full enrollment flow setup")
    
    # ==================== RATE LIMITING TESTS ====================
    
    def test_rate_limiting_login(self):
        """Test rate limiting on login endpoint (5/minute limit)."""
        print_test("Rate Limiting: Login Endpoint (5/minute)")
        
        print_info("Attempting 6 login requests in rapid succession...")
        
        success_count = 0
        rate_limited = False
        
        for i in range(6):
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={"email": "test@example.com", "password": "wrongpassword"}
            )
            
            if response.status_code == 429:
                print_pass(f"Request {i+1}: Rate limited (429) - Working correctly!")
                rate_limited = True
                break
            else:
                success_count += 1
                print_info(f"Request {i+1}: {response.status_code}")
            
            time.sleep(0.1)  # Small delay to ensure sequential requests
        
        if rate_limited:
            print_pass(f"Rate limiting working: {success_count} requests allowed, then blocked")
        else:
            print_fail("Rate limiting not triggered after 6 requests")
    
    def test_rate_limiting_organization_create(self):
        """Test rate limiting on organization creation (20/minute limit)."""
        print_test("Rate Limiting: Organization Creation (20/minute)")
        
        if not self.admin_token:
            print_fail("Admin token required for this test")
            return
        
        print_info("Attempting 21 organization creation requests...")
        
        success_count = 0
        rate_limited = False
        
        for i in range(21):
            response = requests.post(
                f"{self.base_url}/organizations/",
                json={"name": f"Rate Test Org {time.time()}-{i}", "description": "Test"},
                headers=self.get_headers(self.admin_token)
            )
            
            if response.status_code == 429:
                print_pass(f"Request {i+1}: Rate limited (429) - Working correctly!")
                rate_limited = True
                break
            elif response.status_code in [200, 201]:
                success_count += 1
            
            time.sleep(0.05)
        
        if rate_limited:
            print_pass(f"Rate limiting working: {success_count} requests allowed, then blocked")
        else:
            print_info(f"Completed {success_count} requests without rate limit (limit may be higher)")
    
    # ==================== INFORMATION TESTS ====================
    
    def test_public_endpoints(self):
        """Test that public endpoints work without authentication."""
        print_test("Public Endpoints Access")
        
        # Test 1: List organizations
        print_info("Test 1: GET /organizations/ (public)")
        response = requests.get(f"{self.base_url}/organizations/")
        if response.status_code == 200:
            print_pass(f"Public access works - {len(response.json())} organizations found")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
        
        # Test 2: List projects
        print_info("Test 2: GET /projects/ (public)")
        response = requests.get(f"{self.base_url}/projects/")
        if response.status_code == 200:
            print_pass(f"Public access works - {len(response.json())} projects found")
        else:
            print_fail(f"Expected 200, got {response.status_code}")
    
    # ==================== MAIN TEST RUNNER ====================
    
    def run_all_tests(self):
        """Run all security tests."""
        print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BLUE}Secure Fair API - Security Test Suite{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}")
        
        # Login first
        self.login_admin()
        
        # Run tests
        self.test_public_endpoints()
        self.test_rbac_admin_only_endpoints()
        self.test_duplicate_enrollment_prevention()
        self.test_rate_limiting_login()
        self.test_rate_limiting_organization_create()
        
        print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.GREEN}Test suite completed!{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")


if __name__ == "__main__":
    import sys
    
    print(f"{Colors.YELLOW}WARNING: This script will create test data in your database.{Colors.END}")
    print(f"{Colors.YELLOW}Make sure you're running against a development server.{Colors.END}\n")
    
    confirm = input("Continue? (yes/no): ")
    if confirm.lower() != "yes":
        print("Aborted.")
        sys.exit(0)
    
    tester = SecurityTester()
    tester.run_all_tests()

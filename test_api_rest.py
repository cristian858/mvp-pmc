#!/usr/bin/env python
"""
Test script for SafeSign AI REST API
Tests all major endpoints to ensure proper functionality
"""
import requests
import json
import sys
import time
from pathlib import Path

BASE_URL = "http://localhost:8080/api/v1"
session = requests.Session()

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_test(name, passed, response=None):
    """Print test result"""
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"{status} {name}")
    if not passed and response:
        try:
            print(f"  Response: {response.json()}")
        except:
            print(f"  Response: {response.text[:200]}")

def test_auth_check():
    """Test /auth/check endpoint (no auth required)"""
    response = session.get(f"{BASE_URL}/auth/check")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("data", {}).get("authenticated") == False
    print_test("GET /auth/check (unauthenticated)", passed, response)
    return passed

def test_register():
    """Test /auth/register endpoint"""
    # Use timestamp to ensure unique email
    timestamp = int(time.time() * 1000)
    response = session.post(f"{BASE_URL}/auth/register", json={
        "name": "Test User",
        "email": f"test{timestamp}@example.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!"
    })
    passed = response.status_code == 201
    data = response.json()
    passed = passed and data.get("success") == True
    passed = passed and "@example.com" in data.get("data", {}).get("email", "")
    print_test("POST /auth/register", passed, response)
    return passed

def test_auth_me():
    """Test /auth/me endpoint"""
    response = session.get(f"{BASE_URL}/auth/me")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("success") == True
    passed = passed and data.get("data", {}).get("name") == "Test User"
    print_test("GET /auth/me", passed, response)
    return passed

def test_list_documents():
    """Test /documents endpoint"""
    # Re-register since we logged out in a previous test
    timestamp = int(time.time() * 1000)
    session.post(f"{BASE_URL}/auth/register", json={
        "name": "Test User 2",
        "email": f"test{timestamp}@example.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!"
    })
    
    response = session.get(f"{BASE_URL}/documents")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("success") == True
    passed = passed and "pagination" in data
    passed = passed and data.get("pagination", {}).get("total") == 0
    print_test("GET /documents (paginated)", passed, response)
    return passed

def test_list_biometry():
    """Test /biometry endpoint"""
    response = session.get(f"{BASE_URL}/biometry")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("success") == True
    passed = passed and "pagination" in data
    print_test("GET /biometry", passed, response)
    return passed

def test_list_signatures():
    """Test /signatures endpoint"""
    response = session.get(f"{BASE_URL}/signatures")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("success") == True
    passed = passed and "pagination" in data
    print_test("GET /signatures", passed, response)
    return passed

def test_logout():
    """Test /auth/logout endpoint"""
    response = session.post(f"{BASE_URL}/auth/logout")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("success") == True
    print_test("POST /auth/logout", passed, response)
    return passed

def test_auth_check_after_logout():
    """Test /auth/check after logout"""
    response = session.get(f"{BASE_URL}/auth/check")
    passed = response.status_code == 200
    data = response.json()
    passed = passed and data.get("data", {}).get("authenticated") == False
    print_test("GET /auth/check (after logout)", passed, response)
    return passed

def main():
    """Run all tests"""
    print(f"\n{'='*50}")
    print("SafeSign AI - REST API Test Suite")
    print(f"Base URL: {BASE_URL}")
    print(f"{'='*50}\n")
    
    tests = [
        ("Authentication", [
            test_auth_check,
            test_register,
            test_auth_me,
        ]),
        ("Documents", [
            test_list_documents,
        ]),
        ("Biometry", [
            test_list_biometry,
        ]),
        ("Signatures", [
            test_list_signatures,
        ]),
        ("Logout", [
            test_logout,
            test_auth_check_after_logout,
        ]),
    ]
    
    total_passed = 0
    total_tests = 0
    
    for category, test_funcs in tests:
        print(f"\n{YELLOW}{category} Tests:{RESET}")
        for test_func in test_funcs:
            try:
                passed = test_func()
                if passed:
                    total_passed += 1
                total_tests += 1
            except Exception as e:
                print_test(test_func.__name__, False)
                print(f"  Error: {str(e)}")
                total_tests += 1
    
    print(f"\n{'='*50}")
    print(f"Test Results: {total_passed}/{total_tests} passed")
    print(f"{'='*50}\n")
    
    return 0 if total_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(main())

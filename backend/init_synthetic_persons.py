#!/usr/bin/env python3
"""
Initialize Firestore with synthetic test persons for prototype demo.
These are clearly fake users for demonstration purposes only.

Usage:
    python init_synthetic_persons.py
"""
from google.cloud import firestore
from datetime import datetime, timezone
import sys

# Configuration
PROJECT_ID = "gb-demos"
DATABASE_ID = "consent-mgmt"

def init_synthetic_persons():
    """Initialize Firestore with synthetic test persons."""
    print(f"🎭 Initializing Synthetic Test Persons")
    print(f"📊 Project: {PROJECT_ID}")
    print(f"📊 Database: {DATABASE_ID}")
    print("=" * 60)
    
    try:
        # Initialize Firestore client
        db = firestore.Client(project=PROJECT_ID, database=DATABASE_ID)
        print("✅ Connected to Firestore")
        
        # Synthetic test persons (clearly fake data)
        synthetic_persons = [
            {
                'medicaid_id': 'CO-DEMO-001',
                'first_name': 'Alice',
                'last_name': 'Anderson',
                'ssn_last_4': '1234',
                'date_of_birth': '1985-03-15',
                'address': {
                    'street': '123 Demo Street',
                    'city': 'Denver',
                    'state': 'CO',
                    'zip': '80202'
                },
                'email': 'alice.demo@test.local',
                'phone': '+1-555-0001',
                'active': True,
                'is_synthetic': True,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            },
            {
                'medicaid_id': 'CO-DEMO-002',
                'first_name': 'Bob',
                'last_name': 'Builder',
                'ssn_last_4': '5678',
                'date_of_birth': '1990-07-22',
                'address': {
                    'street': '456 Test Avenue',
                    'city': 'Aurora',
                    'state': 'CO',
                    'zip': '80012'
                },
                'email': 'bob.demo@test.local',
                'phone': '+1-555-0002',
                'active': True,
                'is_synthetic': True,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            },
            {
                'medicaid_id': 'CO-DEMO-003',
                'first_name': 'Carol',
                'last_name': 'Chen',
                'ssn_last_4': '9012',
                'date_of_birth': '1978-11-30',
                'address': {
                    'street': '789 Sample Lane',
                    'city': 'Boulder',
                    'state': 'CO',
                    'zip': '80301'
                },
                'email': 'carol.demo@test.local',
                'phone': '+1-555-0003',
                'active': True,
                'is_synthetic': True,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
        ]
        
        print(f"\n📝 Creating {len(synthetic_persons)} synthetic test persons...")
        print("-" * 60)
        
        created_count = 0
        for person in synthetic_persons:
            # Use Medicaid ID as document ID for easy lookup
            doc_ref = db.collection('synthetic_persons').document(person['medicaid_id'])
            doc_ref.set(person)
            
            created_count += 1
            print(f"✅ Created: {person['first_name']} {person['last_name']}")
            print(f"   Medicaid ID: {person['medicaid_id']}")
            print(f"   SSN Last 4: {person['ssn_last_4']}")
            print(f"   DOB: {person['date_of_birth']}")
            print(f"   Address: {person['address']['street']}, {person['address']['city']}, {person['address']['state']} {person['address']['zip']}")
            print()
        
        print("=" * 60)
        print(f"🎉 Successfully created {created_count} synthetic test persons!")
        print("\n📊 Verify in Firestore Console:")
        print(f"https://console.cloud.google.com/firestore/data/synthetic_persons?project={PROJECT_ID}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error initializing synthetic persons: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure you have Firestore enabled in your project")
        print("2. Check that you have proper authentication:")
        print("   gcloud auth application-default login")
        print("3. Verify project access:")
        print(f"   gcloud config set project {PROJECT_ID}")
        return False


def verify_synthetic_persons():
    """Verify that synthetic persons were created successfully."""
    try:
        db = firestore.Client(project=PROJECT_ID, database=DATABASE_ID)
        persons = list(db.collection('synthetic_persons').stream())
        
        print(f"\n🔍 Verification: Found {len(persons)} synthetic persons in Firestore")
        
        if persons:
            print("\nTest Users for Demo:")
            print("-" * 60)
            for doc in persons:
                data = doc.to_dict()
                print(f"  👤 {data.get('first_name')} {data.get('last_name')}")
                print(f"     Medicaid ID: {data.get('medicaid_id')}")
                print(f"     SSN Last 4: {data.get('ssn_last_4')}")
                print(f"     DOB: {data.get('date_of_birth')}")
                print(f"     ZIP: {data.get('address', {}).get('zip')}")
                print()
        
        return len(persons) > 0
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False


def create_demo_instructions():
    """Print demo instructions for using the synthetic persons."""
    print("\n" + "=" * 60)
    print("📋 DEMO INSTRUCTIONS")
    print("=" * 60)
    print("\nTo test the KBA flow, use these credentials:")
    print("\n1️⃣  Alice Anderson (CO-DEMO-001)")
    print("   - Medicaid ID: CO-DEMO-001")
    print("   - SSN Last 4: 1234")
    print("   - DOB: 1985-03-15 (or 03/15/1985)")
    print("   - ZIP: 80202")
    print("   - Street: 123 Demo Street")
    print("\n2️⃣  Bob Builder (CO-DEMO-002)")
    print("   - Medicaid ID: CO-DEMO-002")
    print("   - SSN Last 4: 5678")
    print("   - DOB: 1990-07-22 (or 07/22/1990)")
    print("   - ZIP: 80012")
    print("   - Street: 456 Test Avenue")
    print("\n3️⃣  Carol Chen (CO-DEMO-003)")
    print("   - Medicaid ID: CO-DEMO-003")
    print("   - SSN Last 4: 9012")
    print("   - DOB: 1978-11-30 (or 11/30/1978)")
    print("   - ZIP: 80301")
    print("   - Street: 789 Sample Lane")
    print("\n💡 KBA requires 2 out of 4 fields to be correct:")
    print("   - SSN Last 4")
    print("   - Date of Birth")
    print("   - ZIP Code")
    print("   - Street Address")
    print("=" * 60)


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  🎭 Synthetic Test Persons - Firestore Initialization")
    print("=" * 60 + "\n")
    
    # Initialize synthetic persons
    success = init_synthetic_persons()
    
    if success:
        # Verify
        print("\n" + "=" * 60)
        verify_synthetic_persons()
        print("=" * 60)
        
        # Show demo instructions
        create_demo_instructions()
        
        sys.exit(0)
    else:
        sys.exit(1)

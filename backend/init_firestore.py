#!/usr/bin/env python3
"""
Initialize Firestore with sample provider data.
Run this script once after deploying to populate the database.

Usage:
    python init_firestore.py
"""
from google.cloud import firestore
from datetime import datetime
import sys

# Configuration
PROJECT_ID = "gb-demos"

def init_providers():
    """Initialize Firestore with sample healthcare providers."""
    print(f"🔧 Initializing Firestore in project: {PROJECT_ID}")
    print("=" * 60)
    
    try:
        # Initialize Firestore client
        db = firestore.Client(project=PROJECT_ID)
        print("✅ Connected to Firestore")
        
        # Sample providers for Colorado
        providers = [
            {
                'name': 'Denver Health',
                'address': '777 Bannock St, Denver, CO 80204',
                'type': 'healthcare',
                'active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                'name': 'UCHealth',
                'address': '1635 Aurora Court, Aurora, CO 80045',
                'type': 'healthcare',
                'active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                'name': "Children's Hospital Colorado",
                'address': '13123 E 16th Ave, Aurora, CO 80045',
                'type': 'healthcare',
                'active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                'name': 'Kaiser Permanente Colorado',
                'address': '10350 E Dakota Ave, Denver, CO 80247',
                'type': 'healthcare',
                'active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                'name': 'Mental Health Center of Denver',
                'address': '4141 E Dickenson Pl, Denver, CO 80222',
                'type': 'behavioral_health',
                'active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        ]
        
        print(f"\n📝 Creating {len(providers)} providers...")
        print("-" * 60)
        
        created_count = 0
        for provider in providers:
            # Create document with auto-generated ID
            doc_ref = db.collection('providers').document()
            provider['id'] = doc_ref.id
            doc_ref.set(provider)
            
            created_count += 1
            print(f"✅ Created: {provider['name']}")
            print(f"   ID: {provider['id']}")
            print(f"   Address: {provider['address']}")
            print(f"   Type: {provider['type']}")
            print()
        
        print("=" * 60)
        print(f"🎉 Successfully created {created_count} providers!")
        print("\n📊 Verify in Firestore Console:")
        print(f"https://console.cloud.google.com/firestore/data/providers?project={PROJECT_ID}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error initializing Firestore: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure you have Firestore enabled in your project")
        print("2. Check that you have proper authentication:")
        print("   gcloud auth application-default login")
        print("3. Verify project access:")
        print(f"   gcloud config set project {PROJECT_ID}")
        return False


def verify_providers():
    """Verify that providers were created successfully."""
    try:
        db = firestore.Client(project=PROJECT_ID)
        providers = list(db.collection('providers').stream())
        
        print(f"\n🔍 Verification: Found {len(providers)} providers in Firestore")
        
        if providers:
            print("\nProviders:")
            for doc in providers:
                data = doc.to_dict()
                print(f"  - {data.get('name')} ({data.get('type')})")
        
        return len(providers) > 0
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  Colorado Consent Management - Firestore Initialization")
    print("=" * 60 + "\n")
    
    # Initialize providers
    success = init_providers()
    
    if success:
        # Verify
        print("\n" + "=" * 60)
        verify_providers()
        print("=" * 60 + "\n")
        sys.exit(0)
    else:
        sys.exit(1)

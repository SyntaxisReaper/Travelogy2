#!/usr/bin/env python
"""
Create demo users for Vercel production deployment
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travelogy_backend.settings')

try:
    django.setup()
    from apps.authentication.models import User
    
    def create_demo_users():
        demo_users = [
            {
                'email': 'demo@travelogy.com',
                'username': 'demo_user',
                'password': 'demo123',
                'first_name': 'Demo',
                'last_name': 'User',
            },
            {
                'email': 'test@example.com', 
                'username': 'test_user',
                'password': 'password123',
                'first_name': 'Test',
                'last_name': 'User',
            }
        ]
        
        created_users = []
        
        for user_data in demo_users:
            # Delete existing user if exists
            User.objects.filter(email=user_data['email']).delete()
            
            # Create new demo user
            user = User.objects.create_user(
                email=user_data['email'],
                username=user_data['username'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                location_tracking_consent=True,
                data_sharing_consent=True,
                analytics_consent=True,
                marketing_consent=False
            )
            
            created_users.append(user)
            print(f"✅ Created demo user: {user.email} / {user_data['password']}")
        
        print(f"\n🎉 Successfully created {len(created_users)} demo users!")
        print("\n📝 Demo Accounts:")
        for i, user_data in enumerate(demo_users):
            print(f"{i+1}. Email: {user_data['email']} | Password: {user_data['password']}")
        
        return created_users
    
    if __name__ == '__main__':
        create_demo_users()
        
except ImportError as e:
    print(f"❌ Django not properly configured: {e}")
    print("This script should be run in a Django environment")
except Exception as e:
    print(f"❌ Error creating demo users: {e}")
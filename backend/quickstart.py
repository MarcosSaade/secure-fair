#!/usr/bin/env python3
"""
Quick start script for Secure Fair backend development.
"""
import os
import sys
import subprocess


def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n{description}...")
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"✓ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("Secure Fair Backend - Quick Start")
    print("=" * 60)
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("\n⚠️  .env file not found!")
        print("\nGenerating cryptographic keys...")
        if not run_command("python3 generate_keys.py", "Key generation"):
            print("\n❌ Failed to generate keys. Please run manually:")
            print("   python3 generate_keys.py")
            sys.exit(1)
        
        print("\n⚠️  Please update .env file with the generated keys before continuing.")
        print("   1. Open .env file")
        print("   2. Replace placeholder values with generated keys")
        print("   3. Run this script again")
        sys.exit(0)
    
    print("\n✓ .env file found")
    
    # Check if virtual environment exists
    if not os.path.exists("venv"):
        print("\n📦 Creating virtual environment...")
        if not run_command("python3 -m venv venv", "Virtual environment creation"):
            sys.exit(1)
    
    # Activate virtual environment and install dependencies
    activate_cmd = "source venv/bin/activate" if os.name != 'nt' else "venv\\Scripts\\activate"
    
    print("\n📦 Installing dependencies...")
    if os.name != 'nt':
        install_cmd = f"{activate_cmd} && pip install -r requirements.txt"
    else:
        install_cmd = f"venv\\Scripts\\pip install -r requirements.txt"
    
    if not run_command(install_cmd, "Dependency installation"):
        print("\n⚠️  Please install dependencies manually:")
        print("   pip install -r requirements.txt")
    
    # Check if database has data
    print("\n🗄️  Checking database...")
    print("\nOptions:")
    print("1. Initialize with sample data (recommended for development)")
    print("2. Create admin user only")
    print("3. Skip database initialization")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        if not run_command("python3 init_db.py", "Database initialization"):
            print("\n⚠️  Failed to initialize database")
    elif choice == "2":
        email = input("Admin email: ").strip()
        password = input("Admin password: ").strip()
        if email and password:
            run_command(
                f"python3 create_admin.py {email} {password}",
                "Admin user creation"
            )
    
    print("\n" + "=" * 60)
    print("✓ Setup Complete!")
    print("=" * 60)
    print("\nTo start the development server:")
    print("  uvicorn app.main:app --reload")
    print("\nAPI Documentation:")
    print("  http://localhost:8000/docs")
    print("\nAPI Info:")
    print("  http://localhost:8000")
    print("=" * 60)


if __name__ == "__main__":
    main()

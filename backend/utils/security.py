"""
Security utilities for hashing, token generation, and validation.
"""
import bcrypt
import secrets
from typing import Tuple


def hash_value(value: str) -> str:
    """
    Hashes a value using bcrypt.
    Used for storing sensitive data like SSN last 4 and DOB.
    
    Args:
        value: The value to hash
        
    Returns:
        Hashed value as a string
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(value.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_hash(value: str, hashed_value: str) -> bool:
    """
    Verifies a value against its hash.
    
    Args:
        value: The plaintext value to verify
        hashed_value: The hashed value to compare against
        
    Returns:
        True if the value matches the hash, False otherwise
    """
    try:
        return bcrypt.checkpw(value.encode('utf-8'), hashed_value.encode('utf-8'))
    except Exception:
        return False


def generate_token(length: int = 32) -> str:
    """
    Generates a cryptographically secure random token.
    Used for verification links and session tokens.
    
    Args:
        length: Length of the token in bytes (default 32)
        
    Returns:
        URL-safe token string
    """
    return secrets.token_urlsafe(length)


def generate_verification_token() -> Tuple[str, str]:
    """
    Generates a verification token and its hash.
    
    Returns:
        Tuple of (token, hashed_token)
    """
    token = generate_token()
    hashed = hash_value(token)
    return token, hashed

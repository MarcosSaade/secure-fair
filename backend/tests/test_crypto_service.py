"""Tests for enrollment code hashing and expiration helpers."""

from datetime import datetime, timedelta, timezone

from app.services.crypto_service import crypto_service


def test_enrollment_code_hash_normalizes_case_and_whitespace():
    code = "  ab12cd  "

    expected_hash = crypto_service.hash_enrollment_code("AB12CD")

    assert crypto_service.hash_enrollment_code(code) == expected_hash
    assert crypto_service.verify_enrollment_code(code, expected_hash)


def test_enrollment_code_expiration_helper_handles_timezone_aware_datetimes():
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=5)

    assert not crypto_service.is_enrollment_code_expired(expires_at)


def test_enrollment_code_expiration_helper_handles_naive_datetimes():
    expires_at = datetime.utcnow() + timedelta(seconds=5)

    assert not crypto_service.is_enrollment_code_expired(expires_at)


def test_generated_student_ed25519_keypair_is_valid():
    private_key, public_key = crypto_service.generate_student_ed25519_keypair()

    assert len(private_key) == 64
    assert len(public_key) == 64
    assert crypto_service.is_valid_ed25519_public_key(public_key)


def test_verify_student_contract_signature_roundtrip():
    private_key, public_key = crypto_service.generate_student_ed25519_keypair()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=120)
    message = crypto_service.build_contract_challenge_message(
        student_id=10,
        contract_hash="a" * 64,
        nonce="nonce-123",
        expires_at=expires_at,
    )

    import nacl.encoding
    import nacl.signing

    signing_key = nacl.signing.SigningKey(private_key.encode(), encoder=nacl.encoding.HexEncoder)
    signature = signing_key.sign(message.encode()).signature.hex()

    assert crypto_service.verify_student_contract_signature(public_key, message, signature)
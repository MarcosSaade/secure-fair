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
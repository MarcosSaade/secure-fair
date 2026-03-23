/**
 * Utility functions for managing enrollment codes
 */

export const generateCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const validateCode = (code, enrollmentCodes) => {
  const codeObj = enrollmentCodes.find((c) => c.code === code.toUpperCase());

  if (!codeObj) {
    return { valid: false, error: "Código no encontrado" };
  }

  const now = new Date().getTime();
  const expiresAt = new Date(codeObj.expires_at).getTime();

  if (expiresAt < now) {
    return { valid: false, error: "Código expirado" };
  }

  if (codeObj.is_used) {
    return { valid: false, error: "Código ya utilizado" };
  }

  return { valid: true, codeObj };
};

export const markCodeAsUsed = (codeId, studentId, enrollmentCodes) => {
  const updatedCodes = enrollmentCodes.map((code) => {
    if (code.code_id === codeId) {
      return {
        ...code,
        is_used: true,
        used_by: studentId,
        used_at: new Date().toISOString(),
      };
    }
    return code;
  });

  return updatedCodes;
};

export const getTimeUntilExpiry = (expiresAt) => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const difference = expiry - now;

  if (difference <= 0) {
    return { expired: true, display: "Expirado" };
  }

  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    expired: false,
    display: `${hours}h ${minutes}m ${seconds}s`,
    totalSeconds: difference / 1000,
  };
};
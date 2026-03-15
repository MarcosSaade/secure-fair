export const enrollStudentWithCode = (enteredCode) => {
  const username = sessionStorage.getItem("username");
  const studentData = JSON.parse(sessionStorage.getItem("studentData"));

  if (!username || !studentData) {
    return {
      success: false,
      message: "No se pudo identificar al estudiante. Inicia sesión nuevamente.",
    };
  }

  //  Prevent multiple enrollments
  if (studentData.project_id) {
    return {
      success: false,
      message: "Ya estás inscrito en un proyecto.",
    };
  }

  const savedCodes =
    JSON.parse(localStorage.getItem("enrollmentCodes")) || [];

  const codeObj = savedCodes.find(
    (code) => code.code === enteredCode.toUpperCase()
  );

  if (!codeObj) {
    return {
      success: false,
      message: "El código ingresado no es válido.",
    };
  }

  if (codeObj.is_used) {
    return {
      success: false,
      message: "Este código ya fue utilizado.",
    };
  }

  const now = new Date().getTime();
  const expiresAt = new Date(codeObj.expires_at).getTime();

  if (expiresAt < now) {
    return {
      success: false,
      message: "El código ha expirado.",
    };
  }

  //  Extra safety: prevent reuse by same matricula
  const alreadyUsed = savedCodes.some(
    (code) => code.used_by === studentData.matricula
  );

  if (alreadyUsed) {
    return {
      success: false,
      message: "Ya has utilizado un código anteriormente.",
    };
  }

  //  Mark code as used
  codeObj.is_used = true;
  codeObj.used_at = new Date().toISOString();
  codeObj.used_by = studentData.matricula;

  localStorage.setItem("enrollmentCodes", JSON.stringify(savedCodes));

  //  Update student account
  const studentAccounts =
    JSON.parse(localStorage.getItem("studentAccounts")) || {};

  if (studentAccounts[username]) {
    studentAccounts[username].project_id = codeObj.project_id;
    studentAccounts[username].orgID = codeObj.socio_id;

    localStorage.setItem(
      "studentAccounts",
      JSON.stringify(studentAccounts)
    );

    sessionStorage.setItem(
      "studentData",
      JSON.stringify(studentAccounts[username])
    );
  }

  return {
    success: true,
    project_id: codeObj.project_id,
    message: "Inscripción exitosa.",
  };
};
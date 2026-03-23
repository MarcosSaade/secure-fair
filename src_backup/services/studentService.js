// src/services/studentService.js

const STORAGE_KEY = "studentAccounts";
const ATTENDANCE_KEY = "attendanceRecords";

// =============================
// STUDENT FUNCTIONS
// =============================

export const getCurrentStudent = () => {
  const username = sessionStorage.getItem("username");
  const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  return students[username] || null;
};

export const getStudentByMatricula = (matricula) => {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  return Object.values(students).find(
    (student) => student.matricula === matricula
  );
};

export const updateStudentProject = (project_id, orgID) => {
  const username = sessionStorage.getItem("username");
  const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  if (!students[username]) return false;

  students[username].project_id = project_id;
  students[username].orgID = orgID;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  sessionStorage.setItem("studentData", JSON.stringify(students[username]));

  return true;
};

// =============================
// CHECK-IN FUNCTIONS
// =============================

const todayString = () => new Date().toISOString().split("T")[0];

export const isAlreadyCheckedIn = (matricula) => {
  const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
  const today = todayString();

  return records.some(
    (record) =>
      record.matricula === matricula &&
      record.date === today
  );
};

export const saveCheckIn = (qrData) => {
  const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
  const today = todayString();

  const newRecord = {
    matricula: qrData.matricula,
    nombre: qrData.nombre,
    date: today,
    checkInTime: new Date().toLocaleTimeString("es-ES"),
    timestamp: new Date().toISOString(),
  };

  records.push(newRecord);

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));

  return true;
};

export const getCheckedInStudentsToday = () => {
  const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
  const today = todayString();

  return records.filter((record) => record.date === today);
};

export const clearOldTestData = () => {
  const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
  const today = todayString();

  const filtered = records.filter(
    (record) => record.date === today
  );

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(filtered));
};
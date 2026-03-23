// src/services/studentService.js

import * as storageService from './StorageService';


//const STORAGE_KEY = "studentAccounts";
const ATTENDANCE_KEY = "attendanceRecords";

// =============================
// STUDENT FUNCTIONS
// =============================

//export const getCurrentStudent = () => {
//  const username = sessionStorage.getItem("username");
 // const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
 // return students[username] || null;
//};

export const getCurrentStudent = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) return null;
  const estudiantes = storageService.getEstudiantes();
  return estudiantes.find(est => est.id_usuario === user.id_usuario) || null;
};


//export const getStudentByMatricula = (matricula) => {
//  const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
//  return Object.values(students).find(
//    (student) => student.matricula === matricula
//  );
//};

export const getStudentByMatricula = (matricula) => {
  const estudiantes = storageService.getEstudiantes();
  return estudiantes.find(est => est.matricula?.trim().toUpperCase() === matricula?.trim().toUpperCase());
};

//export const updateStudentProject = (project_id, orgID) => {
 // const username = sessionStorage.getItem("username");
  //const students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

 // if (!students[username]) return false;

 // students[username].project_id = project_id;
 // students[username].orgID = orgID;

 // localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
 // sessionStorage.setItem("studentData", JSON.stringify(students[username]));

  //return true;
//};

export const updateStudentProject = (id_usuario, id_proyecto, id_organizacion) => {
  const estudiantes = storageService.getEstudiantes();
  const index = estudiantes.findIndex(est => est.id_usuario === id_usuario);
  if (index < 0) return false;

  estudiantes[index] = {
    ...estudiantes[index],
    id_proyecto: id_proyecto,
    id_organizacion: id_organizacion,
  };

  storageService.saveEstudiante(estudiantes);
  sessionStorage.setItem("studentData", JSON.stringify(estudiantes[index]));
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
    id_usuario: qrData.id_usuario,
    matricula: qrData.matricula,
    nombre: qrData.nombre,
    apellidos: qrData.apellidos,
    date: today,
    checkInTime: new Date().toLocaleTimeString("es-ES"),
    timestamp: new Date().toISOString(),
  };

  records.push(newRecord);

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));


  const estudiantes = storageService.getEstudiantes();
  const index = estudiantes.findIndex(est => est.matricula === qrData.matricula);
  if (index >= 0) {
    estudiantes[index] = {
      ...estudiantes[index],
      checked_in_at: today,
    };
    storageService.saveEstudiante(estudiantes);
  }

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
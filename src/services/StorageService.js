// src/services/storageService.js

//import { students } from "../pages/students";

//const dummies = Object.values(students);
console.log(">>> storageService.js cargado <<<");


const STORAGE_KEYS = {
  usuarios: "usuarios",
  estudiantes: "estudiantes",
  organizaciones: "organizaciones",
  proyectos: "proyectos",
  inscripciones: "inscripciones",
  admins: "admins",
};

// =============================
// GENERIC HELPERS
// =============================

export const getCollection = (key) => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS[key])) || {};
};
 
export const saveToCollection = (key, id, data) => {
  const collection = getCollection(key);
  collection[id] = data;
  console.log('Guardando en colección:', key, 'ID:', id, 'Data:', data);
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(collection));
};

export const deleteFromCollection = (key, id) => {
  const collection = getCollection(key);
  delete collection[id];
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(collection));
};

// =============================
// ENTITY-SPECIFIC FUNCTIONS
// =============================

// ---- ESTUDIANTES ----
export const getEstudiantes = () => {
  const data = JSON.parse(localStorage.getItem('estudiantes'));
  return data || [];
};

export const saveEstudiante = (studentData) => {
  if (Array.isArray(studentData)) {
    console.error("saveEstudiante recibió un array, se esperaba un objeto:", studentData);
    return;
  }
  const estudiantes = getEstudiantes();
  console.log('Antes de guardad:', estudiantes);
  const index = estudiantes.findIndex(est => String(est.id_usuario) === String(studentData.id_usuario));
  if (index >= 0) {
    estudiantes[index] = 
      { ...estudiantes[index], ...studentData };
  } else {
      estudiantes.push(studentData);
  }

  console.log('estudiante nuevo:', studentData);
  localStorage.setItem("estudiantes", JSON.stringify(estudiantes));

  window.dispatchEvent(new Event("studentUpdated")); 

};

// ---- USUARIOS ----
export const getUsuarios = () => Object.values(getCollection("usuarios"));

export const saveUsuario = (id_usuario, data) => {
  saveToCollection("usuarios", id_usuario, data);
};

// ---- ORGANIZACIONES ----
export const getOrganizaciones = () => Object.values(getCollection("organizaciones"));

export const saveOrganizacion = (id_organizacion, data) => {
  saveToCollection("organizaciones", id_organizacion, data);
};

// ---- PROYECTOS ----
export const getProyectos = () => Object.values(getCollection("proyectos"));

export const saveProyecto = (id_proyecto, data) => {
  saveToCollection("proyectos", id_proyecto, data);
};

// ---- INSCRIPCIONES ----
export const getInscripciones = () => Object.values(getCollection("inscripciones"));

export const saveInscripcion = (id_inscripcion, data) => {
  saveToCollection("inscripciones", id_inscripcion, data);
};

export const createInscripcion = (data) => {
  const id = crypto.randomUUID();

  const nueva = {
    id_inscripcion: id,
    ...data,
  };

  saveToCollection("inscripciones", id, nueva);

  return nueva;
};

// ---- ADMINS ----
export const getAdmins = () => Object.values(getCollection("admins"));

export const saveAdmin = (id_admin, data) => {
  saveToCollection("admins", id_admin, data);
};

// ---- SOCIOS ----
export const getSocios = () => {
  const data = getCollection("socios");
  // Handle both array and object formats
  if (Array.isArray(data)) {
    return data;
  }
  return Object.values(data);
};

export const saveSocio = (id_socio, data) => {
  saveToCollection("socios", id_socio, data);
};

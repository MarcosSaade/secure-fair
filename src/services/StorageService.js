// src/services/storageService.js
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
export const getEstudiantes = () => Object.values(getCollection("estudiantes"));

export const saveEstudiante = (username, data) => {
  saveToCollection("estudiantes", username, data);
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

// ---- ADMINS ----
export const getAdmins = () => Object.values(getCollection("admins"));

export const saveAdmin = (id_admin, data) => {
  saveToCollection("admins", id_admin, data);
};


import apiClient from './api';

console.log(">>> storageService.js (API + LocalStorage Sync) cargado <<<");

const STORAGE_KEYS = {
  usuarios: "usuarios",
  estudiantes: "estudiantes",
  organizaciones: "organizaciones",
  proyectos: "proyectos",
  inscripciones: "inscripciones",
  admins: "admins",
  socios: "socios"
};

// =============================
// INITIALIZATION FROM DB
// =============================
export const initStorageFromDB = async () => {
  try {
    console.log("Sincronizando LocalStorage con Base de Datos...");
    
    // Fetch all entities
    const [students, users, orgs, projects, enrollments] = await Promise.all([
      apiClient.get('/students'),
      apiClient.get('/users'),
      apiClient.get('/organizations'),
      apiClient.get('/projects'),
      apiClient.get('/enrollments')
    ]);

    // Store in localStorage with backward-compatible properties
    const studentsMapped = (students.data.data || []).map(s => ({
      ...s,
      id_usuario: s.user_id,
      nombre: s.full_name,
      apellidos: '', // Merged in full_name
      celular: s.phone,
      correo: s.user ? s.user.email : null,
      username: s.user ? s.user.username : null,
      contraseña: s.user ? s.user.password_hash : null
    }));
    localStorage.setItem(STORAGE_KEYS.estudiantes, JSON.stringify(studentsMapped));
    
    const usersMap = {};
    (users.data.data || []).forEach(u => {
      u.id_usuario = u.id;
      u.correo = u.email;
      u.contraseña = u.password_hash;
      u.tipo = u.role;
      u.activo = u.is_active;
      usersMap[u.id] = u;
    });
    localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(usersMap));

    const orgsArray = (orgs.data.data || []).map(o => ({
      ...o,
      id_organizacion: o.id,
      nombre: o.name,
      nombre_osf: o.name // main_pageBec expects nombre_osf!
    }));
    localStorage.setItem(STORAGE_KEYS.organizaciones, JSON.stringify(orgsArray));

    const projectsArray = (projects.data.data || []).map(p => ({
      ...p,
      id_proyecto: p.id,
      nombre: p.name,
      nombre_proyecto: p.name, // Just in case
      id_organizacion: p.org_id,
      descripcion: p.description,
      cupo_estudiantes: p.capacity
    }));
    localStorage.setItem(STORAGE_KEYS.proyectos, JSON.stringify(projectsArray));

    const inscripcionesArray = (enrollments.data.data || []).map(i => ({
      ...i,
      id_inscripcion: i.id,
      id_usuario: i.student_user_id,
      id_proyecto: i.project_id
    }));
    localStorage.setItem(STORAGE_KEYS.inscripciones, JSON.stringify(inscripcionesArray));

    // Calculate admins and socios (Arrays)
    const usersList = users.data.data || [];
    const adminsArray = usersList.filter(u => u.role === 'admin').map(u => ({
      ...u,
      id_usuario: u.id,
      correo: u.email,
      contraseña: u.password_hash,
      tipo: u.role,
      activo: u.is_active
    }));
    localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(adminsArray));

    const sociosArray = usersList.filter(u => u.role === 'socio').map(u => ({
      ...u,
      id_usuario: u.id,
      correo: u.email,
      contraseña: u.password_hash,
      tipo: u.role,
      activo: u.is_active
    }));
    localStorage.setItem(STORAGE_KEYS.socios, JSON.stringify(sociosArray));

    console.log("Sincronización completa.");
    window.dispatchEvent(new Event("storageSynced"));
  } catch (error) {
    console.error("Error sincronizando con la base de datos:", error);
  }
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
  const index = estudiantes.findIndex(est => String(est.id_usuario || est.user_id) === String(studentData.id_usuario || studentData.user_id));
  
  if (index >= 0) {
    estudiantes[index] = { ...estudiantes[index], ...studentData };
    // API UPDATE Async
    apiClient.put(`/students/${studentData.id_usuario || studentData.user_id}`, studentData).catch(console.error);
  } else {
    estudiantes.push(studentData);
    // API CREATE Async
    apiClient.post('/students', studentData).catch(console.error);
  }

  localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
  window.dispatchEvent(new Event("studentUpdated")); 
};

// ---- USUARIOS ----
export const getUsuarios = () => Object.values(getCollection("usuarios"));

export const saveUsuario = (id_usuario, data) => {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
  usuarios[id_usuario] = { ...usuarios[id_usuario], ...data };
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  // Use PUT if has id, POST otherwise
  if (id_usuario) {
    apiClient.put(`/users/${id_usuario}`, data).catch(console.error);
  } else {
    apiClient.post('/users', data).catch(console.error);
  }
};

// ---- ORGANIZACIONES ----
export const getOrganizaciones = () => {
  const data = JSON.parse(localStorage.getItem("organizaciones"));
  return data || [];
};

export const saveOrganizacion = (id_organizacion, data) => {
  const orgs = getOrganizaciones();
  const index = orgs.findIndex(o => String(o.id_organizacion) === String(id_organizacion));
  if (index >= 0) {
    orgs[index] = { ...orgs[index], ...data };
    localStorage.setItem("organizaciones", JSON.stringify(orgs));
    // Existing: PUT
    const dbId = data.id || id_organizacion;
    if (dbId) apiClient.put(`/organizations/${dbId}`, data).catch(console.error);
  } else {
    orgs.push(data);
    localStorage.setItem("organizaciones", JSON.stringify(orgs));
    // New: POST
    apiClient.post('/organizations', data).then(res => {
      // Update the new item with the real DB id
      const newOrgs = getOrganizaciones();
      const idx = newOrgs.findIndex(o => String(o.id_organizacion) === String(id_organizacion));
      if (idx >= 0 && res.data.data) {
        newOrgs[idx].id = res.data.data.id;
        newOrgs[idx].id_organizacion = res.data.data.id;
        localStorage.setItem("organizaciones", JSON.stringify(newOrgs));
      }
    }).catch(console.error);
  }
};

// ---- PROYECTOS ----
export const getProyectos = () => {
  const data = JSON.parse(localStorage.getItem("proyectos"));
  return data || [];
};

export const saveProyecto = (id_proyecto, data) => {
  const projs = getProyectos();
  const index = projs.findIndex(p => String(p.id_proyecto) === String(id_proyecto));
  if (index >= 0) {
    projs[index] = { ...projs[index], ...data };
    localStorage.setItem("proyectos", JSON.stringify(projs));
    const dbId = data.id || id_proyecto;
    if (dbId) apiClient.put(`/projects/${dbId}`, data).catch(console.error);
  } else {
    projs.push(data);
    localStorage.setItem("proyectos", JSON.stringify(projs));
    apiClient.post('/projects', data).catch(console.error);
  }
};

// ---- INSCRIPCIONES ----
export const getInscripciones = () => {
  const data = JSON.parse(localStorage.getItem("inscripciones"));
  return data || [];
};

export const saveInscripcion = (id_inscripcion, data) => {
  const ins = getInscripciones();
  const index = ins.findIndex(i => String(i.id_inscripcion) === String(id_inscripcion));
  if (index >= 0) ins[index] = data;
  else ins.push(data);
  localStorage.setItem("inscripciones", JSON.stringify(ins));
};

export const createInscripcion = (data) => {
  const id = crypto.randomUUID();
  const nueva = {
    id_inscripcion: id,
    ...data,
  };
  const ins = getInscripciones();
  ins.push(nueva);
  localStorage.setItem("inscripciones", JSON.stringify(ins));
  
  // API Create Async
  apiClient.post('/enrollments', {
    student_user_id: data.id_usuario || data.student_user_id,
    project_id: data.id_proyecto || data.project_id
  }).catch(console.error);

  return nueva;
};

// ---- ADMINS ----
export const getAdmins = () => {
  const data = JSON.parse(localStorage.getItem("admins"));
  return data || [];
};

export const saveAdmin = (id_admin, data) => {
  const admins = getAdmins();
  const index = admins.findIndex(a => String(a.id_usuario) === String(id_admin));
  if (index >= 0) admins[index] = { ...admins[index], ...data };
  else admins.push(data);
  localStorage.setItem("admins", JSON.stringify(admins));
  data.role = 'admin';
  const dbId = data.id || id_admin;
  if (dbId && index >= 0) {
    apiClient.put(`/users/${dbId}`, data).catch(console.error);
  } else {
    apiClient.post('/users', data).catch(console.error);
  }
};

// ---- SOCIOS ----
export const getSocios = () => {
  const data = JSON.parse(localStorage.getItem("socios"));
  return data || [];
};

export const saveSocio = (id_socio, data) => {
  const socios = getSocios();
  const index = socios.findIndex(s => String(s.id_usuario) === String(id_socio));
  if (index >= 0) socios[index] = { ...socios[index], ...data };
  else socios.push(data);
  localStorage.setItem("socios", JSON.stringify(socios));
  data.role = 'socio';
  const dbId = data.id || id_socio;
  if (dbId && index >= 0) {
    apiClient.put(`/users/${dbId}`, data).catch(console.error);
  } else {
    apiClient.post('/users', data).catch(console.error);
  }
};

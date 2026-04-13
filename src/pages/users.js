// src/users.js

export const users = [
  {
    id_usuario: 1,
    username: "student1",
    contraseña: "1234",
    tipo: "student",
    activo: true
  },
  {
    id_usuario: 2,
    username: "socio1",
    contraseña: "pass1",
    tipo: "socio",
    activo: true,
    id_organizacion: 1
  },
  {
    id_usuario: 3,
    username: "socio2",
    contraseña: "pass3",
    tipo: "socio",
    activo: true,
    id_organizacion: 2
  },
  {
    id_usuario: 4,
    username: "socio3",
    contraseña: "pass4",
    tipo: "socio",
    activo: true,
    id_organizacion: 3
  },
  {
    id_usuario: 5,
    username: "admin1",
    contraseña: "pass2",
    tipo: "admin",
    activo: true
  },
  {
    id_usuario: 6,
    username: "becario1",
    contraseña: "pass5",
    tipo: "becario",
    activo: true
  }
];

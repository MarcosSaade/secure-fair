// use projects and organizations to populate dropdowns in the admin edit page
// Admin will see a table of all students registered for each project, with the option to edit their information (name, matricula, carrera, correo, celular, hora), 
// project enrolled, organization enrolled
// Admin will also be able to filter students by project and organization, and search for specific students by name or matricula.
// Admin can also delete or add students manually, in case of any issues with the import process.
// Admin can delete and add project or organization and edit their information.
import * as storageService from '../../services/StorageService';
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";

const AdminEdit = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterOrg, setFilterOrg] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  // Para diálogos
  const [openStudent, setOpenStudent] = useState(false);
  const [openDeleteEnrollment, setOpenDeleteEnrollment] = useState(false);
  const [openDeleteChoice, setOpenDeleteChoice] = useState(false);
  const [openDeleteStudent, setOpenDeleteStudent] = useState(false);
  const [openCapacityWarning, setOpenCapacityWarning] = useState(false);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [studentToDeleteEnrollment, setStudentToDeleteEnrollment] = useState(null);
  const [studentToDeleteCompletely, setStudentToDeleteCompletely] = useState(null);
  const [enrollmentToDeleteIndex, setEnrollmentToDeleteIndex] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [periodConflictMessage, setPeriodConflictMessage] = useState("");
  const [capacityWarningForAdd, setCapacityWarningForAdd] = useState(false);
  
  const [formStudent, setFormStudent] = useState({
    nombre: "",
    apellidos: "",
    matricula: "",
    correo: "",
    celular: "",
    carrera: "",
    hora_registro: "",
    selectedProjectToChange: "",
    id_organizacion: "",
    id_proyecto: "",
  });

  const [formAddProject, setFormAddProject] = useState({
    id_organizacion: "",
    id_proyecto: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [addProjectError, setAddProjectError] = useState(null);

  

  // Cargar datos desde la API (fuente de la verdad: base de datos)
  useEffect(() => {
    loadData();
    window.addEventListener('studentUpdated', loadData);
    return () => window.removeEventListener('studentUpdated', loadData);
  }, []);

  const loadData = async () => {
    try {
      const apiBase = `/api`;
      const [studsRes, projsRes, orgsRes] = await Promise.all([
        fetch(`${apiBase}/students`),
        fetch(`${apiBase}/projects`),
        fetch(`${apiBase}/organizations`),
      ]);
      const [studsData, projsData, orgsData] = await Promise.all([
        studsRes.json(),
        projsRes.json(),
        orgsRes.json(),
      ]);

      if (studsData.success) {
        // Normalize student fields for the UI
        const normalized = studsData.data.map(s => ({
          ...s,
          id_usuario: s.user_id ?? s.id_usuario,
          nombre: s.nombre || s.full_name || '',
          apellidos: s.apellidos || '',
          carrera: s.carrera || '',
          celular: s.phone || s.celular || '',
          correo: s.correo || s.correo_personal || (s.user?.email) || '',
          hora_registro: s.hora_registro || '',
          // Map DB enrollments → UI enrollment format
          enrollments: (s.enrollments || []).map(e => ({
            id_proyecto: e.project_id ?? e.id_proyecto,
            id_organizacion: e.project?.org_id ?? e.id_organizacion,
            periodo: e.periodo ?? e.fair_period?.name ?? '',
            period_id: e.period_id,
            enrollment_id: e.id ?? e.enrollment_id,
            nombre_proyecto: e.nombre_proyecto ?? e.project?.name ?? '',
            nombre_osf: e.nombre_osf ?? e.project?.organization?.name ?? '',
          })),
        }));
        setStudents(normalized);
      }

      if (projsData.success) {
        const normalizedProjs = projsData.data.map(p => ({
          ...p,
          id_proyecto: p.id,
          id_organizacion: p.org_id,
          nombre_proyecto: p.name,
          cupo_estudiantes: p.capacity,
          inscritos: p.enrollments?.length ?? 0,
        }));
        setProjects(normalizedProjs);
        localStorage.setItem('proyectos', JSON.stringify(normalizedProjs));
      }

      if (orgsData.success) {
        const normalizedOrgs = orgsData.data.map(o => ({
          ...o,
          id_organizacion: o.id,
          nombre_osf: o.name,
        }));
        setOrganizations(normalizedOrgs);
        localStorage.setItem('organizaciones', JSON.stringify(normalizedOrgs));
      }
    } catch (err) {
      console.error('Error cargando datos desde API:', err);
      // Fallback a localStorage
      const studsRaw = storageService.getEstudiantes() || [];
      setStudents(Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw));
      setProjects(JSON.parse(localStorage.getItem('proyectos')) || []);
      setOrganizations(JSON.parse(localStorage.getItem('organizaciones')) || []);
    }
  };

  // Obtener proyectos de una organización específica
  const getProjectsByOrg = (orgId) => {
    if (!orgId) return [];
    return projects.filter((p) => Number(p.id_organizacion) === Number(orgId));
  };

  // Calcular cupos disponibles (cupo_estudiantes - inscritos)
  const getAvailableSlots = (projectId) => {
    const project = projects.find((p) => Number(p.id_proyecto) === Number(projectId));
    if (!project) return 0;

    const inscritos = project.inscritos || 0;
    const cupoTotal = project.cupo_estudiantes || 0;

    return Math.max(0, cupoTotal - inscritos);
  };

  // Verificar si el proyecto está lleno
  const isProjectFull = (projectId) => {
    return getAvailableSlots(projectId) === 0;
  };

  // Verificar conflicto de periodo
  const checkPeriodConflict = (studentId, newProjectId, excludeEnrollmentIndex = null) => {
    const student = students.find(s => s.id_usuario === studentId);
    if (!student) return null;

    const newProject = projects.find(p => Number(p.id_proyecto) === Number(newProjectId));
    if (!newProject) return null;

    const newPeriodo = newProject.periodo;
    if (!newPeriodo) return null;

    // Revisar todos los enrollments del estudiante
    if (Array.isArray(student.enrollments)) {
      for (let i = 0; i < student.enrollments.length; i++) {
        // Saltar el enrollment que estamos editando
        if (excludeEnrollmentIndex === i) continue;

        const enrollment = student.enrollments[i];
        // Use the enrollment's own periodo (source of truth from API/fair_period.name)
        const enrollmentPeriodo = enrollment.periodo || projects.find(p => Number(p.id_proyecto) === Number(enrollment.id_proyecto))?.periodo;
        
        if (enrollmentPeriodo && enrollmentPeriodo === newPeriodo) {
          return `El alumno no puede ser inscrito en "${newPeriodo}" porque ya tiene un proyecto en ese periodo.`;
        }
      }
    }

    return null;
  };

  // Actualizar cupo del proyecto
  const updateProjectCapacity = (projectId, increment) => {
    const updatedProjects = projects.map((p) => {
      if (Number(p.id_proyecto) === Number(projectId)) {
        const currentInscritos = p.inscritos || 0;
        const newInscritos = Math.max(0, currentInscritos + increment);
        return { ...p, inscritos: newInscritos };
      }
      return p;
    });

    setProjects(updatedProjects);
    localStorage.setItem("proyectos", JSON.stringify(updatedProjects));
  };

  // Obtener todos los enrollments del estudiante (incluyendo formato antiguo)
  const getStudentAllEnrollments = (student) => {
    const enrollments = [];
    
    // Si tiene array de enrollments (nuevo formato)
    if (Array.isArray(student.enrollments) && student.enrollments.length > 0) {
      enrollments.push(...student.enrollments.map((e, idx) => ({ ...e, index: idx })));
    }
    
    // Si tiene id_proyecto antiguo (backward compatibility)
    if (student.id_proyecto && (!Array.isArray(student.enrollments) || student.enrollments.length === 0)) {
      const proj = projects.find(p => Number(p.id_proyecto) === Number(student.id_proyecto));
      enrollments.push({
        id_proyecto: student.id_proyecto,
        id_organizacion: student.id_organizacion,
        periodo: proj?.periodo || null,
        index: 0
      });
    }
    
    return enrollments;
  };

  // Obtener periodos únicos de todos los estudiantes
  const getUniquePeriods = () => {
    const periods = new Set();
    students.forEach((s) => {
      const allEnrollments = getStudentAllEnrollments(s);
      allEnrollments.forEach((enrollment) => {
        // Use enrollment.periodo first (source of truth from API), fallback to project lookup
        const periodo = enrollment.periodo || projects.find(p => Number(p.id_proyecto) === Number(enrollment.id_proyecto))?.periodo;
        if (periodo) {
          periods.add(periodo);
        }
      });
    });
    return Array.from(periods).sort();
  };

  // Abrir diálogo de estudiante
  const handleOpenStudent = (student = null) => {
    if (student) {
      setEditingStudentId(student.id_usuario);
      setFormStudent({
        nombre: student.nombre || "",
        apellidos: student.apellidos || "",
        matricula: student.matricula || "",
        correo: student.correo || "",
        celular: student.celular || "",
        carrera: student.carrera || "",
        hora_registro: student.hora_registro || "",
        selectedProjectToChange: "",
        id_organizacion: "",
        id_proyecto: "",
      });
      setPeriodConflictMessage("");
    } else {
      setEditingStudentId(null);
      setFormStudent({
        nombre: "",
        apellidos: "",
        matricula: "",
        correo: "",
        celular: "",
        carrera: "",
        hora_registro: "",
        selectedProjectToChange: "",
        id_organizacion: "",
        id_proyecto: "",
      });
    }
    setOpenStudent(true);
  };

  // Abrir diálogo de agregar proyecto
  const handleOpenAddProject = () => {
    setOpenStudent(false);
    setFormAddProject({
      id_organizacion: "",
      id_proyecto: "",
    });
    setPeriodConflictMessage("");
    setCapacityWarningForAdd(false);
    setOpenAddProject(true);
  };

  // Guardar estudiante
  const handleSaveStudent = () => {
    setErrorMessage(null);
    // Validaciones básicas
    if (!formStudent.nombre.trim()) {
   // Return "El nombre es requerido" in red text below the field instead of alert

      setErrorMessage("El nombre es requerido");
      return;
    }
    if (!formStudent.apellidos.trim()) {
      setErrorMessage("Los apellidos son requeridos");
      return;
    }
    if (!formStudent.matricula.trim()) {
      setErrorMessage("La matrícula es requerida");
      return;
    }
    // Matricula must have be A01659878 format
    if (formStudent.matricula.trim() && !/^[A-Za-z]\d{8}$/.test(formStudent.matricula.trim())) {
      setErrorMessage("La matrícula debe tener el formato A01659878");
      return;
    }
    if (!formStudent.correo.trim()) {
      setErrorMessage("El correo es requerido");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formStudent.correo)) {
      setErrorMessage("El correo no es válido");
      return;
    }
    // Also not valid if email has @tec.mx
    if (formStudent.correo.includes("@tec.mx")) {
      setErrorMessage("El correo no no puede contener '@tec.mx'");
      return;
    }

    if (!formStudent.celular.trim()) {
      setErrorMessage("El celular es requerido");
      return;
    }

    // Celular
    if (formStudent.celular.trim() && !/^\d{10}$/.test(formStudent.celular.trim())) {
      setErrorMessage("El celular debe contener exactamente 10 dígitos");
      return;
    }


    // Si está editando y NO tiene proyectos, y seleccionó uno
    if (editingStudentId) {
      const student = students.find(s => s.id_usuario === editingStudentId);
      const allEnrollments = getStudentAllEnrollments(student);
      
      if (allEnrollments.length === 0 && formStudent.id_proyecto) {
        // Student has no projects and is trying to add one
        if (!formStudent.id_organizacion) {
          setErrorMessage("Debes seleccionar una organización");
          return;
        }
        if (!formStudent.id_proyecto) {
          setErrorMessage("Debes seleccionar un proyecto");
          return;
        }

        // Validate project belongs to org
        const selectedProject = projects.find(
          (p) => Number(p.id_proyecto) === Number(formStudent.id_proyecto)
        );
        
        if (!selectedProject || Number(selectedProject.id_organizacion) !== Number(formStudent.id_organizacion)) {
          setErrorMessage("El proyecto seleccionado no pertenece a la organización elegida");
          return;
        }

        // Check capacity
        if (isProjectFull(formStudent.id_proyecto)) {
          setOpenCapacityWarning(true);
          return;
        }
      }
    }

    // Si está seleccionado un proyecto para cambiar
    if (formStudent.selectedProjectToChange !== "") {
      if (!formStudent.id_organizacion) {
        setErrorMessage("Debes seleccionar una organización");
        return;
      }
      if (!formStudent.id_proyecto) {
        setErrorMessage("Debes seleccionar un proyecto");
        return;
      }

      // Validar que el proyecto pertenezca a la organización seleccionada
      const selectedProject = projects.find(
        (p) => Number(p.id_proyecto) === Number(formStudent.id_proyecto)
      );
      
      if (!selectedProject || Number(selectedProject.id_organizacion) !== Number(formStudent.id_organizacion)) {
        alert("El proyecto seleccionado no pertenece a la organización elegida");
        return;
      }

      // Verificar conflicto de periodo (excluir el enrollment que estamos editando)
      const conflictMessage = checkPeriodConflict(
        editingStudentId, 
        formStudent.id_proyecto, 
        Number(formStudent.selectedProjectToChange)
      );
      if (conflictMessage) {
        setPeriodConflictMessage(conflictMessage);
        return;
      }

      // Obtener el enrollment actual para verificar cupo
      const student = students.find(s => s.id_usuario === editingStudentId);
      const allEnrollments = getStudentAllEnrollments(student);
      const oldEnrollment = allEnrollments[Number(formStudent.selectedProjectToChange)];

      const projectChanged = oldEnrollment?.id_proyecto !== formStudent.id_proyecto;

      if (projectChanged && isProjectFull(formStudent.id_proyecto)) {
        setOpenCapacityWarning(true);
        return;
      }
    }

    proceedWithSave();
  };

  // Guardar nuevo proyecto para estudiante
  const handleSaveAddProject = () => {
    if (!formAddProject.id_organizacion) {
      setAddProjectError("Debes seleccionar una organización");
      return;
    }
    if (!formAddProject.id_proyecto) {
      setAddProjectError("Debes seleccionar un proyecto");
      return;
    }



    // Validar que el proyecto pertenezca a la organización seleccionada
    const selectedProject = projects.find(
      (p) => Number(p.id_proyecto) === Number(formAddProject.id_proyecto)
    );
    
    if (!selectedProject || Number(selectedProject.id_organizacion) !== Number(formAddProject.id_organizacion)) {
      setAddProjectError("El proyecto seleccionado no pertenece a la organización elegida");
      return;
    }

    const student = students.find(s => s.id_usuario === editingStudentId);
    const allEnrollments = getStudentAllEnrollments(student);
    const alreadyEnrolled = allEnrollments.some(
      e => Number(e.id_proyecto) === Number(formAddProject.id_proyecto));

    if (alreadyEnrolled) {
      setAddProjectError("El estudiante ya está inscrito en ese proyecto");
      return;
    }

    // Verificar conflicto de periodo
    const conflictMessage = checkPeriodConflict(editingStudentId, formAddProject.id_proyecto);
    if (conflictMessage) {
      setPeriodConflictMessage(conflictMessage);
      return;
    }

    // Verificar cupo
    if (isProjectFull(formAddProject.id_proyecto)) {
      setCapacityWarningForAdd(true);
      return;
    }

    proceedWithAddProject();
  };

  // Proceder con agregar proyecto
  const proceedWithAddProject = async () => {
    const apiBase = `/api`;
    const newProjectId = Number(formAddProject.id_proyecto);
    
    try {
      // Use the project's own period_id (each project belongs to a specific period)
      const selectedProject = projects.find(p => Number(p.id_proyecto) === newProjectId);
      let periodId = selectedProject?.period_id;
      
      // Fallback: if the project doesn't have period_id locally, let the backend resolve it
      if (!periodId) {
        const period = await fetch(`${apiBase}/periods/active`).then(r => r.json()).catch(() => ({ data: { id: 1 } }));
        periodId = period?.data?.id || 1;
      }
      
      const res = await fetch(`${apiBase}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_user_id: editingStudentId,
          project_id: newProjectId,
          period_id: periodId,
        })
      });
      const result = await res.json();
      if (!result.success) {
        // Show backend error clearly (period conflict, duplicate, etc)
        setAddProjectError(result.message || 'Error al agregar proyecto');
        setPeriodConflictMessage("");
        setCapacityWarningForAdd(false);
        return;
      }
      
    } catch (err) {
      console.error("Error adding project:", err);
      setAddProjectError('Error de conexión al agregar proyecto. Verifica que el backend esté corriendo.');
      setCapacityWarningForAdd(false);
      return;
    }
    
    await loadData();
    setOpenAddProject(false);
    setFormAddProject({ id_organizacion: "", id_proyecto: "" });
    setPeriodConflictMessage("");
    setAddProjectError(null);
    setCapacityWarningForAdd(false);
  };

  // Proceder con guardado — persiste en API + recarga desde DB
  const proceedWithSave = async () => {
    const apiBase = `/api`;

    if (editingStudentId) {
      // === EDITAR ESTUDIANTE EXISTENTE ===
      const student = students.find(s => s.id_usuario === editingStudentId);
      const allEnrollments = getStudentAllEnrollments(student);

      // 1. Actualizar perfil del estudiante en DB
      try {
        const profileRes = await fetch(`${apiBase}/students/${editingStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: `${formStudent.nombre} ${formStudent.apellidos}`.trim(),
            nombre: formStudent.nombre,
            apellidos: formStudent.apellidos,
            matricula: formStudent.matricula,
            correo: formStudent.correo,
            celular: formStudent.celular,
            carrera: formStudent.carrera,
            hora_registro: formStudent.hora_registro,
          })
        });
        const profileResult = await profileRes.json();
        if (!profileResult.success) {
          setErrorMessage(`Error actualizando perfil: ${profileResult.message}`);
          setOpenCapacityWarning(false);
          return;
        }
      } catch (err) {
        setErrorMessage('Error de conexión al actualizar el perfil del estudiante.');
        setOpenCapacityWarning(false);
        return;
      }

      // 2. Si quiere cambiar/agregar proyecto → manejar inscripción en DB
      if (formStudent.selectedProjectToChange !== "" || (allEnrollments.length === 0 && formStudent.id_proyecto)) {
        const newProjectId = Number(formStudent.id_proyecto);
        if (newProjectId) {
          // Si tiene inscripción existente, actualizar via PUT enrollment
          const existingEnrollment = allEnrollments[Number(formStudent.selectedProjectToChange)] || allEnrollments[0];
          const oldProjectId = existingEnrollment?.id_proyecto;

          if (existingEnrollment?.enrollment_id) {
            // Actualizar inscripción existente
            try {
              const putRes = await fetch(`${apiBase}/enrollments/${existingEnrollment.enrollment_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: newProjectId })
              });
              const putResult = await putRes.json();
              if (!putResult.success) {
                // Mostrar error de conflicto de periodo al usuario
                setPeriodConflictMessage(putResult.message || 'Error al cambiar el proyecto.');
                setOpenCapacityWarning(false);
                setOpenStudent(true);
                return;
              }
            } catch (err) {
              setErrorMessage('Error de conexión al actualizar la inscripción.');
              setOpenCapacityWarning(false);
              return;
            }
          } else {
            // Crear inscripción nueva
            const targetProject = projects.find(p => Number(p.id_proyecto) === newProjectId);
            let periodId = targetProject?.period_id;
            if (!periodId) {
              const period = await fetch(`${apiBase}/periods/active`).then(r => r.json()).catch(() => ({ data: { id: 1 } }));
              periodId = period?.data?.id || 1;
            }
            try {
              const enrollRes = await fetch(`${apiBase}/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  student_user_id: editingStudentId,
                  project_id: newProjectId,
                  period_id: periodId,
                })
              });
              const enrollResult = await enrollRes.json();
              if (!enrollResult.success) {
                setPeriodConflictMessage(enrollResult.message || 'Error al inscribir al estudiante.');
                setOpenCapacityWarning(false);
                setOpenStudent(true);
                return;
              }
            } catch (err) {
              setErrorMessage('Error de conexión al crear la inscripción.');
              setOpenCapacityWarning(false);
              return;
            }
          }

          if (oldProjectId && oldProjectId !== newProjectId) {
            updateProjectCapacity(oldProjectId, -1);
          }
          updateProjectCapacity(newProjectId, 1);
        }
      }

    } else {
      // === CREAR NUEVO ESTUDIANTE ===
      try {
        // Crear usuario primero
        const userRes = await fetch(`${apiBase}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formStudent.correo,
            username: formStudent.matricula.toLowerCase(),
            password: 'pass1',
            role: 'student',
          })
        });
        const userResult = await userRes.json();

        if (userResult.success) {
          const newUserId = userResult.data.id || userResult.data.id_usuario;

          // Crear perfil de estudiante
          await fetch(`${apiBase}/students/${newUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matricula: formStudent.matricula,
              full_name: `${formStudent.nombre} ${formStudent.apellidos}`.trim(),
              nombre: formStudent.nombre,
              apellidos: formStudent.apellidos,
              celular: formStudent.celular,
              correo: formStudent.correo,
              carrera: formStudent.carrera,
              hora_registro: formStudent.hora_registro,
            })
          });

          // Inscribir en proyecto si seleccionó uno
          if (formStudent.id_proyecto) {
            // Use the project's own period_id
            const targetProject = projects.find(p => Number(p.id_proyecto) === Number(formStudent.id_proyecto));
            let periodId = targetProject?.period_id;
            if (!periodId) {
              const period = await fetch(`${apiBase}/periods/active`).then(r => r.json()).catch(() => ({ data: { id: 1 } }));
              periodId = period?.data?.id || 1;
            }
            await fetch(`${apiBase}/enrollments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                student_user_id: newUserId,
                project_id: Number(formStudent.id_proyecto),
                period_id: periodId,
              })
            });
            updateProjectCapacity(formStudent.id_proyecto, 1);
          }
        }
      } catch (err) {
        console.error('Error creando estudiante:', err);
      }
    }

    // Recargar datos desde la API para reflejar cambios reales
    await loadData();
    setOpenStudent(false);
    setOpenCapacityWarning(false);
    setPeriodConflictMessage("");
  };

  // Confirmar eliminación de inscripción
  const handleConfirmDeleteEnrollment = async (student, enrollmentIndex) => {
    const apiBase = `/api`;
    const oldEnrollment = student.enrollments[enrollmentIndex];
    const enrollId = oldEnrollment?.enrollment_id || oldEnrollment?.id;
    
    if (oldEnrollment && enrollId) {
      try {
        const res = await fetch(`${apiBase}/enrollments/${enrollId}`, { method: 'DELETE' });
        const result = await res.json();
        if (!result.success) {
          alert(`Error al eliminar inscripción: ${result.message}`);
        }
      } catch (err) {
        console.error("Error deleting enrollment:", err);
        alert('Error de conexión al eliminar inscripción');
      }
    } else {
      alert('No se encontró el ID de la inscripción. Intenta recargar la página.');
    }
    
    await loadData();
    setOpenDeleteEnrollment(false);
    setStudentToDeleteEnrollment(null);
    setEnrollmentToDeleteIndex(null);
  };

  // Abrir diálogo de elección: eliminar proyecto o estudiante
  const handleOpenDeleteChoice = (student) => {
    setStudentToDeleteCompletely(student);
    setOpenDeleteChoice(true);
  };

  // Confirmar eliminación de estudiante
  const handleConfirmDeleteStudent = async () => {
    const apiBase = `/api`;
    if (studentToDeleteCompletely) {
      try {
        const res = await fetch(`${apiBase}/users/${studentToDeleteCompletely.id_usuario}`, { method: 'DELETE' });
        const result = await res.json();
        if (!result.success) {
          alert(`Error al eliminar estudiante: ${result.message}`);
        } else {
          console.log("Estudiante eliminado:", studentToDeleteCompletely.nombre);
        }
      } catch (err) {
        console.error("Error deleting student:", err);
        alert('Error de conexión al eliminar estudiante');
      }
      await loadData();
    }
    setOpenDeleteStudent(false);
    setStudentToDeleteCompletely(null);
  };

  // Manejar selección de eliminar proyecto
  const handleSelectDeleteProject = () => {
    const allEnrollments = getStudentAllEnrollments(studentToDeleteCompletely);
    
    if (allEnrollments.length === 1) {
      // Si solo tiene uno, eliminar directamente
      handleConfirmDeleteEnrollment(studentToDeleteCompletely, allEnrollments[0].index);
      setOpenDeleteChoice(false);
    } else {
      // Si tiene múltiples, mostrar selector
      setStudentToDeleteEnrollment(studentToDeleteCompletely);
      setEnrollmentToDeleteIndex(null);
      setOpenDeleteChoice(false);
      setOpenDeleteEnrollment(true);
    }
  };

  // Manejar selección de eliminar estudiante
  const handleSelectDeleteStudent = () => {
    setOpenDeleteStudent(true);
    setOpenDeleteChoice(false);
  };

  // Filtros
  const filteredStudents = students
    .filter(
      (s) =>
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.matricula?.includes(search)
    )
    .filter((s) => {
      // Filtro por periodo
      if (filterPeriod) {
        const allEnrollments = getStudentAllEnrollments(s);
        return allEnrollments.some((enrollment) => {
          const periodo = enrollment.periodo || projects.find(p => Number(p.id_proyecto) === Number(enrollment.id_proyecto))?.periodo;
          return periodo === filterPeriod;
        });
      }
      return true;
    })
    .filter((s) => {
      if (!filterProject) return true;

      const allEnrollments = getStudentAllEnrollments(s);
      return allEnrollments.some((enrollment) => Number(enrollment.id_proyecto) === Number(filterProject));
    })
    .filter((s) => {
      if (!filterOrg) return true;
      const allEnrollments = getStudentAllEnrollments(s);
      return allEnrollments.some((enrollment) => Number(enrollment.id_organizacion) === Number(filterOrg));
    }
    );
  return (
    
    <Box p={4}>
      <Box mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            minWidth: "auto",
            textTransform: "none",
            fontWeight: 500
          }}
        >
          Volver
        </Button>
      </Box>

      <Typography variant="h4">
        Administrar Estudiantes
      </Typography>


      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Buscar estudiante"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          {/* Filtro por periodo */}
          <Select
            value={filterPeriod}
            displayEmpty
            onChange={(e) => setFilterPeriod(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos los periodos</MenuItem>
            {getUniquePeriods().map((periodo) => (
              <MenuItem key={periodo} value={periodo}>
                {periodo}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filterOrg}
            displayEmpty
            onChange={(e) => setFilterOrg(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas las organizaciones</MenuItem>
            {[...organizations].sort((a, b) => (a.nombre_osf || '').localeCompare(b.nombre_osf || '', 'es')).map((o) => (
              <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                {o.nombre_osf}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filterProject}
            displayEmpty
            onChange={(e) => setFilterProject(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos los proyectos</MenuItem>
            {[...projects].sort((a, b) => (a.nombre_proyecto || '').localeCompare(b.nombre_proyecto || '', 'es')).map((p) => {
              const availableSlots = getAvailableSlots(p.id_proyecto);
              const isFull = availableSlots === 0;
              return (
                <MenuItem 
                  key={p.id_proyecto} 
                  value={p.id_proyecto}
                  sx={{ color: isFull ? "#dc2626" : "inherit" }}
                >
                  {p.nombre_proyecto} {isFull && "- LLENO"}
                </MenuItem>
              );
            })}
          </Select>

          <Button variant="contained" onClick={() => handleOpenStudent()}>
            + Agregar Estudiante
          </Button>
        </Box>
      </Paper>

      {/* Tabla de estudiantes */}
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f9ff" }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Matrícula</strong></TableCell>
              <TableCell><strong>Carrera</strong></TableCell>
              <TableCell><strong>Correo</strong></TableCell>
              <TableCell><strong>Celular</strong></TableCell>
              <TableCell><strong>Proyectos Inscritos</strong></TableCell>
              <TableCell><strong>Hora Registro</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((s) => {
              // Get all enrollments
              const enrolledProjects = Array.isArray(s.enrollments)
                ? s.enrollments
                    .map((enrollment, idx) => {
                      const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
                      const org = organizations.find(o => o.id_organizacion === enrollment.id_organizacion);
                      return {
                        ...project,
                        enrollment,
                        enrollmentIndex: idx,
                        org,
                      };
                    })
                    .filter((p) => p.id_proyecto)
                : [];

              // Backward compatibility
              let projectsToDisplay = enrolledProjects;
              if (enrolledProjects.length === 0 && s.id_proyecto) {
                const singleProject = projects.find(p => p.id_proyecto === s.id_proyecto);
                if (singleProject) {
                  projectsToDisplay = [{
                    ...singleProject,
                    enrollment: { id_proyecto: s.id_proyecto, id_organizacion: s.id_organizacion },
                    enrollmentIndex: null,
                    org: organizations.find(o => o.id_organizacion === s.id_organizacion),
                  }];
                }
              }

              return (
                <TableRow key={s.id_usuario}>
                  <TableCell>{s.nombre} {s.apellidos || ""}</TableCell>
                  <TableCell>{s.matricula}</TableCell>
                  <TableCell>{s.carrera || "N/A"}</TableCell>
                  <TableCell>{s.correo}</TableCell>
                  <TableCell>{s.celular || "N/A"}</TableCell>
                  <TableCell>
                    {projectsToDisplay.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {projectsToDisplay.map((proj, idx) => (
                          <Box
                            key={`${proj.id_proyecto}-${idx}`}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                              backgroundColor: "#f0f9ff",
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {proj.nombre_proyecto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {proj.org?.nombre_osf} • {proj.enrollment?.periodo || proj.periodo || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{s.hora_registro || "N/A"}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenStudent(s)}
                      sx={{ color: "#0369a1" }}
                    />
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDeleteChoice(s)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog Estudiante - EDITAR/CREAR */}
      <Dialog 
        open={openStudent} 
        onClose={() => setOpenStudent(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ style: { maxHeight: "90vh" } }}
      >
        <DialogTitle>
          {editingStudentId ? "Editar Estudiante" : "Agregar Estudiante"}
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3, overflowY: "auto", p: 3 }}
        >
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            label="Nombre"
            fullWidth
            value={formStudent.nombre}
            onChange={(e) => setFormStudent({ ...formStudent, nombre: e.target.value })}
          />
          <TextField
            label="Apellidos"
            fullWidth
            value={formStudent.apellidos}
            onChange={(e) => setFormStudent({ ...formStudent, apellidos: e.target.value })}
          />
          <TextField
            label="Matrícula"
            fullWidth
            value={formStudent.matricula}
            onChange={(e) => setFormStudent({ ...formStudent, matricula: e.target.value })}
          />
          <TextField
            label="Correo"
            fullWidth
            type="email"
            value={formStudent.correo}
            onChange={(e) => setFormStudent({ ...formStudent, correo: e.target.value })}
          />
          <TextField
            label="Celular"
            fullWidth
            value={formStudent.celular}
            onChange={(e) => setFormStudent({ ...formStudent, celular: e.target.value })}
          />
          <TextField
            label="Carrera"
            fullWidth
            value={formStudent.carrera}
            onChange={(e) => setFormStudent({ ...formStudent, carrera: e.target.value })}
          />
          <TextField
            label="Hora de Registro"
            fullWidth
            value={formStudent.hora_registro}
            onChange={(e) => setFormStudent({ ...formStudent, hora_registro: e.target.value })}
          />

          {/* Si está editando y tiene proyectos, mostrar selector de proyecto a cambiar */}
          {editingStudentId && getStudentAllEnrollments(students.find(s => s.id_usuario === editingStudentId)).length > 0 && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#2479bd" }}>
                ¿Qué proyecto deseas cambiar?
              </Typography>
              <Select
                fullWidth
                value={formStudent.selectedProjectToChange}
                onChange={(e) => {
                  setFormStudent({ 
                    ...formStudent, 
                    selectedProjectToChange: e.target.value,
                    id_organizacion: "",
                    id_proyecto: "",
                  });
                  setPeriodConflictMessage("");
                }}
                displayEmpty
              >
                <MenuItem value="">Selecciona un proyecto para editar</MenuItem>
                {getStudentAllEnrollments(students.find(s => s.id_usuario === editingStudentId)).map((enrollment, idx) => {
                  const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
                  return (
                    <MenuItem key={idx} value={idx}>
                      {project?.nombre_proyecto || enrollment.nombre_proyecto || 'Proyecto'} - {enrollment.periodo || project?.periodo || 'Sin periodo'}
                    </MenuItem>
                  );
                })}
              </Select>

              {/* Mostrar campos de organización y proyecto solo si seleccionó uno */}
              {formStudent.selectedProjectToChange !== "" && (
                <>
                  {periodConflictMessage && (
                    <Alert severity="error">
                      {periodConflictMessage}
                    </Alert>
                  )}

                  {addProjectError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {addProjectError}
                    </Alert>
                  )}

                  <Select
                    value={formStudent.id_organizacion}
                    onChange={(e) => {
                      setFormStudent({
                        ...formStudent,
                        id_organizacion: e.target.value,
                        id_proyecto: "",
                      });
                      setPeriodConflictMessage("");
                    }}
                    displayEmpty
                  >
                    <MenuItem value="">Selecciona una organización</MenuItem>
                    {[...organizations].sort((a, b) => (a.nombre_osf || '').localeCompare(b.nombre_osf || '', 'es')).map((o) => (
                      <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                        {o.nombre_osf}
                      </MenuItem>
                    ))}
                  </Select>

                  <Select
                    value={formStudent.id_proyecto}
                    onChange={(e) => {
                      setFormStudent({ ...formStudent, id_proyecto: e.target.value });
                      setPeriodConflictMessage("");
                    }}
                    displayEmpty
                    disabled={!formStudent.id_organizacion}
                  >
                    <MenuItem value="">
                      {formStudent.id_organizacion ? "Selecciona un proyecto" : "Primero selecciona una organización"}
                    </MenuItem>
                    {formStudent.id_organizacion &&
                      [...getProjectsByOrg(formStudent.id_organizacion)].sort((a, b) => (a.nombre_proyecto || '').localeCompare(b.nombre_proyecto || '', 'es')).map((p) => {
                        const availableSlots = getAvailableSlots(p.id_proyecto);
                        const isFull = availableSlots === 0;
                        return (
                          <MenuItem 
                            key={p.id_proyecto} 
                            value={p.id_proyecto}
                            sx={{ color: isFull ? "#dc2626" : "inherit" }}
                          >
                            {p.nombre_proyecto} {isFull && "- LLENO"}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </>
              )}

              {/* Botón para agregar otro proyecto */}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenAddProject}
                fullWidth
              >
                Agregar Otro Proyecto
              </Button>
            </>
          )}

          {/* Si está editando pero NO tiene proyectos, mostrar selectores de organización y proyecto */}
          {editingStudentId && getStudentAllEnrollments(students.find(s => s.id_usuario === editingStudentId)).length === 0 && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#2479bd" }}>
              
                Agregar Proyecto
              </Typography>

              {addProjectError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {addProjectError}
                </Alert>
              )}
              <Select
                value={formStudent.id_organizacion}
                onChange={(e) => {
                  setFormStudent({
                    ...formStudent,
                    id_organizacion: e.target.value,
                    id_proyecto: "",
                  });
                }}
                displayEmpty
              >
                <MenuItem value="">Selecciona una organización</MenuItem>
                {[...organizations].sort((a, b) => (a.nombre_osf || '').localeCompare(b.nombre_osf || '', 'es')).map((o) => (
                  <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                    {o.nombre_osf}
                  </MenuItem>
                ))}
              </Select>

              <Select
                value={formStudent.id_proyecto}
                onChange={(e) => setFormStudent({ ...formStudent, id_proyecto: e.target.value })}
                displayEmpty
                disabled={!formStudent.id_organizacion}
              >
                <MenuItem value="">
                  {formStudent.id_organizacion ? "Selecciona un proyecto" : "Primero selecciona una organización"}
                </MenuItem>
                {formStudent.id_organizacion &&
                  [...getProjectsByOrg(formStudent.id_organizacion)].sort((a, b) => (a.nombre_proyecto || '').localeCompare(b.nombre_proyecto || '', 'es')).map((p) => {
                    const availableSlots = getAvailableSlots(p.id_proyecto);
                    const isFull = availableSlots === 0;
                    return (
                      <MenuItem 
                        key={p.id_proyecto} 
                        value={p.id_proyecto}
                        sx={{ color: isFull ? "#dc2626" : "inherit" }}
                      >
                        {p.nombre_proyecto} {isFull && "- LLENO"}
                      </MenuItem>
                    );
                  })}
              </Select>
            </>
          )}

          {/* Mostrar campos de organización y proyecto solo si está creando */}
          {!editingStudentId && (
            <>
              <Select
                value={formStudent.id_organizacion}
                onChange={(e) => {
                  setFormStudent({
                    ...formStudent,
                    id_organizacion: e.target.value,
                    id_proyecto: "",
                  });
                }}
                displayEmpty
              >
                <MenuItem value="">Selecciona una organización</MenuItem>
                {[...organizations].sort((a, b) => (a.nombre_osf || '').localeCompare(b.nombre_osf || '', 'es')).map((o) => (
                  <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                    {o.nombre_osf}
                  </MenuItem>
                ))}
              </Select>

              <Select
                value={formStudent.id_proyecto}
                onChange={(e) => setFormStudent({ ...formStudent, id_proyecto: e.target.value })}
                displayEmpty
                disabled={!formStudent.id_organizacion}
              >
                <MenuItem value="">
                  {formStudent.id_organizacion ? "Selecciona un proyecto" : "Primero selecciona una organización"}
                </MenuItem>
                {formStudent.id_organizacion &&
                  [...getProjectsByOrg(formStudent.id_organizacion)].sort((a, b) => (a.nombre_proyecto || '').localeCompare(b.nombre_proyecto || '', 'es')).map((p) => {
                    const availableSlots = getAvailableSlots(p.id_proyecto);
                    const isFull = availableSlots === 0;
                    return (
                      <MenuItem 
                        key={p.id_proyecto} 
                        value={p.id_proyecto}
                        sx={{ color: isFull ? "#dc2626" : "inherit" }}
                      >
                        {p.nombre_proyecto} {isFull && "- LLENO"}
                      </MenuItem>
                    );
                  })}
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudent(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveStudent}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Agregar Proyecto */}
      <Dialog
        open={openAddProject}
        onClose={() => {
          setOpenAddProject(false);
          setFormAddProject({ id_organizacion: "", id_proyecto: "" });
          setPeriodConflictMessage("");
          setCapacityWarningForAdd(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Otro Proyecto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
          {periodConflictMessage && (
            <Alert severity="error">
              {periodConflictMessage}
            </Alert>
          )}
          {addProjectError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addProjectError}
            </Alert>
          )}

          <Select
            value={formAddProject.id_organizacion}
            onChange={(e) => {
              setFormAddProject({
                ...formAddProject,
                id_organizacion: e.target.value,
                id_proyecto: "",
              });
              setPeriodConflictMessage("");
              setAddProjectError("");
            }}
            displayEmpty
          >
            <MenuItem value="">Selecciona una organización</MenuItem>
            {[...organizations].sort((a, b) => (a.nombre_osf || '').localeCompare(b.nombre_osf || '', 'es')).map((o) => (
              <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                {o.nombre_osf}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={formAddProject.id_proyecto}
            onChange={(e) => {
              setFormAddProject({ ...formAddProject, id_proyecto: e.target.value });
              setPeriodConflictMessage("");
              setAddProjectError("");
            }}
            displayEmpty
            disabled={!formAddProject.id_organizacion}
          >
            <MenuItem value="">
              {formAddProject.id_organizacion ? "Selecciona un proyecto" : "Primero selecciona una organización"}
            </MenuItem>
            {formAddProject.id_organizacion &&
              [...getProjectsByOrg(formAddProject.id_organizacion)].sort((a, b) => (a.nombre_proyecto || '').localeCompare(b.nombre_proyecto || '', 'es')).map((p) => {
                const availableSlots = getAvailableSlots(p.id_proyecto);
                const isFull = availableSlots === 0;
                return (
                  <MenuItem
                    key={p.id_proyecto}
                    value={p.id_proyecto}
                    sx={{ color: isFull ? "#dc2626" : "inherit" }}
                  >
                    {p.nombre_proyecto} {isFull && "- LLENO"}
                  </MenuItem>
                );
              })}
          </Select>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => {
            setOpenAddProject(false);
            setFormAddProject({ id_organizacion: "", id_proyecto: "" });
            setPeriodConflictMessage("");
            setCapacityWarningForAdd(false);
          }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveAddProject}>
            Agregar Proyecto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Elección: Eliminar Proyecto o Estudiante */}
      <Dialog
        open={openDeleteChoice}
        onClose={() => {
          setOpenDeleteChoice(false);
          setStudentToDeleteCompletely(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dc2626" }}>
          <WarningIcon />
          ¿Qué deseas eliminar?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selecciona si deseas eliminar un proyecto o al estudiante completo
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Estudiante: <strong>{studentToDeleteCompletely?.nombre} {studentToDeleteCompletely?.apellidos}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteChoice(false);
            setStudentToDeleteCompletely(null);
          }}>
            Cancelar
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleSelectDeleteProject}
          >
            Eliminar un Proyecto
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSelectDeleteStudent}
          >
            Eliminar Estudiante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Selección de Inscripción a Eliminar */}
      <Dialog
        open={openDeleteEnrollment}
        onClose={() => {
          setOpenDeleteEnrollment(false);
          setStudentToDeleteEnrollment(null);
          setEnrollmentToDeleteIndex(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dc2626" }}>
          <WarningIcon />
          Eliminar Inscripción
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selecciona el proyecto que deseas eliminar
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Estudiante: <strong>{studentToDeleteEnrollment?.nombre} {studentToDeleteEnrollment?.apellidos}</strong>
          </Typography>
          
          <Select
            fullWidth
            value={enrollmentToDeleteIndex !== null ? enrollmentToDeleteIndex : ""}
            onChange={(e) => setEnrollmentToDeleteIndex(Number(e.target.value))}
            displayEmpty
          >
            <MenuItem value="">Selecciona un proyecto para eliminar</MenuItem>
            {studentToDeleteEnrollment && getStudentAllEnrollments(studentToDeleteEnrollment).map((enrollment, idx) => {
              const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
              return (
                <MenuItem key={idx} value={idx}>
                  {project?.nombre_proyecto || enrollment.nombre_proyecto || 'Proyecto'} - {enrollment.periodo || project?.periodo || 'Sin periodo'}
                </MenuItem>
              );
            })}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteEnrollment(false);
            setStudentToDeleteEnrollment(null);
            setEnrollmentToDeleteIndex(null);
          }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={enrollmentToDeleteIndex === null}
            onClick={() => {
              if (enrollmentToDeleteIndex !== null && studentToDeleteEnrollment) {
                handleConfirmDeleteEnrollment(studentToDeleteEnrollment, enrollmentToDeleteIndex);
              }
            }}
          >
            Eliminar Inscripción
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación de Estudiante */}
      <Dialog
        open={openDeleteStudent}
        onClose={() => {
          setOpenDeleteStudent(false);
          setStudentToDeleteCompletely(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dc2626" }}>
          <WarningIcon />
          Eliminar Estudiante
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Esta acción es irreversible
          </Alert>
          <Typography>
            ¿Estás seguro de que deseas eliminar al estudiante <strong>{studentToDeleteCompletely?.nombre} {studentToDeleteCompletely?.apellidos}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Matrícula: {studentToDeleteCompletely?.matricula}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteStudent(false);
            setStudentToDeleteCompletely(null);
          }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteStudent}
          >
            Sí, Eliminar Estudiante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Advertencia de Capacidad */}
      <Dialog
        open={openCapacityWarning}
        onClose={() => {
          setOpenCapacityWarning(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            El cupo de este proyecto está lleno.
          </Alert>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            ¿Aún así deseas inscribir a este estudiante en este proyecto?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCapacityWarning(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={proceedWithSave}
          >
            Sí, Inscribir Igualmente
          </Button>
        </DialogActions>
      </Dialog>



      {/* Dialog de Advertencia de Capacidad para Agregar Proyecto */}
      <Dialog
        open={capacityWarningForAdd}
        onClose={() => {
          setCapacityWarningForAdd(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            El cupo de este proyecto está lleno.
          </Alert>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            ¿Aún así deseas agregar a este estudiante en este proyecto?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCapacityWarningForAdd(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={proceedWithAddProject}
          >
            Sí, Agregar Igualmente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEdit;
import React, { useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,

  Button,
  TextField,
  MenuItem,
  IconButton,

  Dialog,
  DialogTitle,
  DialogActions,
  Container

} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'

import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import AdminDashboardPanel from "../../components/dashboard"
import TableChartIcon from '@mui/icons-material/TableChart';


const MainPage = () => {
  const navigate = useNavigate();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Estados
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [studentMatricula] = useState("");
  const [studentName] = useState("");
  const [studentCarrera] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [importedData, setImportedData] = useState(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = `/api`;
        
        const [orgsRes, projsRes, studsRes] = await Promise.all([
          fetch(`${apiBase}/organizations`),
          fetch(`${apiBase}/projects`),
          fetch(`${apiBase}/students`)
        ]);

        const orgsData = await orgsRes.json();
        const projsData = await projsRes.json();
        const studsData = await studsRes.json();

        const orgs = orgsData.data || [];
        const projs = projsData.data || [];
        const studs = studsData.data || [];

        setOrganizaciones(orgs);
        setProjects(projs);
        setStudents(studs);
        
        // Update local storage so other parts of the app can use the fresh data
        localStorage.setItem("organizaciones", JSON.stringify(orgs));
        localStorage.setItem("proyectos", JSON.stringify(projs));
        localStorage.setItem("estudiantes", JSON.stringify(studs));
        
      } catch (err) {
        console.error("Error fetching data from API:", err);
        // Fallback to localStorage
        const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
        const projs = JSON.parse(localStorage.getItem("proyectos")) || [];
        const studsRaw = JSON.parse(localStorage.getItem("estudiantes")) || [];
        const studs = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);
        setOrganizaciones(orgs);
        setProjects(projs);
        setStudents(studs);
      }
    };
    
    fetchData();
  }, []);

  // Filtros de estudiantes
  const filteredStudents = students.filter(s => {
    let matchesOrg = true;
    if (selectedOrg) {
      // Check new format (enrollments array)
      if (Array.isArray(s.enrollments)  && s.enrollments.length > 0) {
        matchesOrg = s.enrollments.some(enrollment => enrollment.id_organizacion === Number(selectedOrg));
      }
      // Check old format (single id_organizacion)
      else if (s.id_organizacion) {
        matchesOrg = s.id_organizacion === Number(selectedOrg);
      } else {
        matchesOrg = false; // No organization info, so it doesn't match
      }
    }

    if (!matchesOrg) return false;
   
    const fullName = `${s.nombre || ""} ${s.apellidos || ""}`.toLowerCase();
    const matchesName = studentName ? (fullName.includes(studentName.toLowerCase())) : true;

    let matchesProject = true;
    if (selectedProject) {
      const selectedProjectNum = Number(selectedProject);
      // Check new format (enrollments array)
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        matchesProject = s.enrollments.some(enrollment => enrollment.id_proyecto === selectedProjectNum);
      }
      // Check old format (single id_proyecto)
      else if (s.id_proyecto) {
        matchesProject = s.id_proyecto === selectedProjectNum;
      }
    }

   
    const matchesMatricula = studentMatricula ? (s.matricula?.toLowerCase().includes(studentMatricula.toLowerCase())) : true;
    const matchesCarrera = studentCarrera ? (s.carrera?.toLowerCase().includes(studentCarrera.toLowerCase())) : true;
    let matchesPeriod = true;
    if (selectedPeriod) {
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        matchesPeriod = s.enrollments.some((enrollment) => {
          return enrollment.periodo === selectedPeriod;
        });
      } else if (s.id_proyecto) {
        const project = projects.find(p => Number(p.id_proyecto || p.id) === Number(s.id_proyecto));
        matchesPeriod = (project?.periodo) === selectedPeriod;
      } else {
        matchesPeriod = false;
      }
    }
    
    return matchesOrg && matchesProject && matchesMatricula && matchesName && matchesPeriod && matchesCarrera;
  });

  

  // Obtener nombre de organización
  const getOrgName = (id) => {
    const org = organizaciones.find((o) => o.id_organizacion === id);
    return org ? org.nombre_osf : "N/A";
  };

 

  // Returns the 4 fixed period names
  const getUniquePeriods = () => ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];


  // Navegación
  const handleCheckIn = () => navigate("/admin/checkin");
  const handleEdit = () => navigate("/admin/edit");
  const handleEditOrganization = () => navigate("/admin/editOrganization");
  const handleTable = () => navigate("/admin/table")

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Mapear a formato que backend espera
      const mappedData = jsonData.map((row, index) => ({
        id_proyecto: index + 1, // opcional si quieres asignar un id temporal
        nombre_osf: row["Nombre oficial de la Organización Socio Formadora (OSF) con la que se realizará el Proyecto Solidario"] || "",
        nombre_proyecto: row['" Nombre del Proyecto Solidario: \n (NOTA: no es el nombre de la OSF ni es el listado de actividades a realizar, ni la clave del CRN, el nombre debe ser atractivo para el estudiante) "'] || "",
        descripcion_proyecto: row['"Objetivo del Proyecto Solidario: \n (El objetivo es el cambio deseado que se quiere lograr con el proyecto solidario respecto al problema identificado) "'] || "",
        lugar: row['"Lugar de trabajo: \nNota: En caso de aplicar; dirección donde el estudiante realizará el Servicio Social"'] || "",
        cupo_estudiantes: row['Cupo de estudiantes: Colocar el número de estudiantes que pueden participar en la experiencia (como recomendación no manejar menos de 10 participantes por grupo)'] || 0,
        duracion: row['Duración de la experiencia: '] || "",
        horas_acreditadas: row['Horas máximas que el estudiante puede acreditar dependiendo de su desempeño: '] || 0,
        id_organizacion: row["id_organizacion"] || 0, // si viene del Excel
      }));

      setImportedData(mappedData);
      setOpenImportDialog(true);
    };
    reader.readAsArrayBuffer(file);
  };

  //  Abrir diálogo de exportación
  const handleExportClick = () => {
    setOpenExportDialog(true);
  };

//  Exportar en CSV
const handleExportCSV = () => {
  // Expand students with multiple enrollments into separate rows
  const dataToExport = [];
  
  filteredStudents.forEach((student) => {
    // Handle new format (enrollments array)
    if (Array.isArray(student.enrollments) && student.enrollments.length > 0) {
      student.enrollments.forEach((enrollment) => {
        const project = projects.find(p => Number(p.id_proyecto || p.id) === Number(enrollment.id_proyecto || enrollment.project_id));
        const periodo = enrollment.periodo || project?.periodo || project?.period_id;
        
        // Only include if period filter matches or no period filter. AND if organization filter matches
        if ((!selectedPeriod || String(periodo) === String(selectedPeriod)) &&
          (!selectedOrg || enrollment.id_organizacion === Number(selectedOrg))){
          dataToExport.push({
            Nombre: `${student.nombre} ${student.apellidos || ""}`,
            Matrícula: student.matricula,
            Carrera: student.carrera || "N/A",
            Correo: student.correo,
            Celular: student.celular || "N/A",
            Proyecto: project?.nombre_proyecto || "N/A",
            Organización: getOrgName(enrollment.id_organizacion),
            Periodo: periodo || "N/A",
            "Hora Registro": student.hora_registro || "N/A",
          });
        }
      });
    }
    // Handle old format (single id_proyecto)
    else if (student.id_proyecto) {
      const project = projects.find(p => Number(p.id_proyecto || p.id) === Number(student.id_proyecto));
      const periodo = project?.periodo || project?.period_id;
    
      
      // Only include if period filter matches or no period filter. or if organization filter matches
      if ((!selectedPeriod || String(periodo) === String(selectedPeriod)) &&
        (!selectedOrg || student.id_organizacion === Number(selectedOrg)))
      {
        dataToExport.push({
          Nombre: `${student.nombre} ${student.apellidos || ""}`,
          Matrícula: student.matricula,
          Carrera: student.carrera || "N/A",
          Correo: student.correo,
          Celular: student.celular || "N/A",
          Proyecto: project?.nombre_proyecto || "N/A",
          Organización: getOrgName(student.id_organizacion),
          Periodo: periodo || "N/A",
          "Hora Registro": student.hora_registro || "N/A",
        });
      }
    }
    // Student with no projects
    else {
      dataToExport.push({
        Nombre: `${student.nombre} ${student.apellidos || ""}`,
        Matrícula: student.matricula,
        Carrera: student.carrera || "N/A",
        Correo: student.correo,
        Celular: student.celular || "N/A",
        Proyecto: "N/A",
        Organización: "N/A",
        Periodo: "N/A",
        "Hora Registro": student.hora_registro || "N/A",
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "estudiantes.csv");

  setOpenExportDialog(false);
};

//  Exportar en XLSX
  const handleExportXLSX = () => {
    // Expand students with multiple enrollments into separate rows
    const dataToExport = [];
    
    filteredStudents.forEach((student) => {
      // Handle new format (enrollments array)
      if (Array.isArray(student.enrollments) && student.enrollments.length > 0) {
        student.enrollments.forEach((enrollment) => {
          const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
          const periodo = enrollment.periodo || project?.periodo;
          
          // Only include if period filter matches or no period filter
          if ((!selectedPeriod || periodo === selectedPeriod) &&
            (!selectedOrg || enrollment.id_organizacion === Number(selectedOrg))) {
            dataToExport.push({
              Nombre: `${student.nombre} ${student.apellidos || ""}`,
              Matrícula: student.matricula,
              Carrera: student.carrera || "N/A",
              Correo: student.correo,
              Celular: student.celular || "N/A",
              Proyecto: project?.nombre_proyecto || "N/A",
              Organización: getOrgName(enrollment.id_organizacion),
              Periodo: periodo || "N/A",
              "Hora Registro": student.hora_registro || "N/A",
            });
          }
        });
      }
      // Handle old format (single id_proyecto)
      else if (student.id_proyecto) {
        const project = projects.find(p => p.id_proyecto === student.id_proyecto);
        const periodo = project?.periodo;
        
        // Only include if period filter matches or no period filter
        if (!selectedPeriod || periodo === selectedPeriod) {
          dataToExport.push({
            Nombre: `${student.nombre} ${student.apellidos || ""}`,
            Matrícula: student.matricula,
            Carrera: student.carrera || "N/A",
            Correo: student.correo,
            Celular: student.celular || "N/A",
            Proyecto: project?.nombre_proyecto || "N/A",
            Organización: getOrgName(student.id_organizacion),
            Periodo: periodo || "N/A",
            "Hora Registro": student.hora_registro || "N/A",
          });
        }
      }
      // Student with no projects
      else {
        dataToExport.push({
          Nombre: `${student.nombre} ${student.apellidos || ""}`,
          Matrícula: student.matricula,
          Carrera: student.carrera || "N/A",
          Correo: student.correo,
          Celular: student.celular || "N/A",
          Proyecto: "N/A",
          Organización: "N/A",
          Periodo: "N/A",
          "Hora Registro": student.hora_registro || "N/A",
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "estudiantes.xlsx");
    setOpenExportDialog(false);
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ================= LEFT SIDEBAR ================= */}
      {isSidebarOpen && (
        <Box
          sx={{
            width: 280,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            px: 4, // Horizontal padding
            pt: 0, // Top padding set to 0 to align with the top bar
            pb: 3, // Bottom padding
            transition: 'width 0.3s ease-in-out', // Smooth transition for sidebar width
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2, // Margin bottom for spacing from title
            }}
          >
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <MenuOpenIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}> {/* Added mt for spacing */}
            Administración
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={handleCheckIn}>
              Check-In
            </Button>

          <Button fullWidth variant="contained" startIcon={<TableChartIcon />} onClick={handleTable}>
              Tabla de Datos
            </Button>

            <Button fullWidth variant="contained" startIcon={<PeopleAltIcon />} onClick={handleEdit}>
              Editar Estudiantes
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="info"
              startIcon={<FolderOpenIcon />}
              onClick={handleEditOrganization}
            >
              Editar Proyectos
            </Button>

            <Button fullWidth variant="contained" startIcon={<UploadFileIcon />} onClick={handleImport}>
              Importar Datos
            </Button>

            <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={handleExportClick}>
              Exportar Datos
            </Button>
          
 
   
          </Box>
        </Box>
      )}

      {/* ================= RIGHT CONTENT ================= */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f7fa',
          p: 5,
          position: 'relative', // Needed for the show sidebar button
        }}
      >
        {!isSidebarOpen && (
          <IconButton
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Container maxWidth="xl">
          {/* HEADER */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Servicio Social - Administración
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Gestiona estudiantes, proyectos y organizaciones desde esta vista. Haz click en Check-In para que el
            estudiante pueda ingresar al evento.
          </Typography>

          {/* FILTER SECTION */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 3,
              mt: 6,
              mb: 4,
            }}
          >
            <TextField
              select
              label="Buscar por organización"
              fullWidth
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {[...organizaciones].sort((a, b) => (a.nombre_osf || a.name || '').localeCompare(b.nombre_osf || b.name || '', 'es')).map((org) => (
                <MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>
                  {org.nombre_osf || org.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Proyecto"
              fullWidth
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...projects]
                .filter((proj) => (selectedOrg ? Number(proj.id_organizacion || proj.org_id) === Number(selectedOrg) : true))
                .sort((a, b) => (a.nombre_proyecto || a.name || '').localeCompare(b.nombre_proyecto || b.name || '', 'es'))
                .map((proj) => (
                  <MenuItem key={proj.id_proyecto || proj.id} value={proj.id_proyecto || proj.id}>
                    {proj.nombre_proyecto || proj.name}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              label="Periodo"
              fullWidth
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniquePeriods().map((period) => (
                <MenuItem key={period} value={period}>
                  {period}
                </MenuItem>
              ))}
            </TextField>

          </Box>

          {/* STATS */}
          <AdminDashboardPanel
                  students={students}
                  projects={projects}
                  organizations={organizaciones}
                  selectedOrg={selectedOrg}
                  selectedProject={selectedProject}
                  selectedPeriod={selectedPeriod}
                />
            <Box></Box>
 
   
        </Container>
      </Box>

      {/* IMPORT DIALOG */}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

        <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Datos importados</DialogTitle>
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Se han importado {importedData ? importedData.length : 0} registros. Revisa que la información sea correcta antes de guardarla.
          </Typography>
         
        </Box>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setOpenImportDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Aquí podrías agregar lógica para guardar los datos importados en el localStorage o enviarlos a un backend
              setStudents((prev) => [...prev, ...importedData]);
              setOpenImportDialog(false);
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* EXPORT DIALOG */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>Selecciona el formato de exportación</DialogTitle>
        <DialogActions sx={{ gap: 1 }}>
          <Button variant="contained" onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Button variant="contained" onClick={handleExportXLSX}>
            Exportar XLSX
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
};

export default MainPage;
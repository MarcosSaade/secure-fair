import React, { useMemo, useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import * as storageService from "../services/StorageService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ─── Paleta ────────────────────────────────────────────────────
const PALETTE = {
  navy:      "#2479bd",
  blue:      "#6AB0D8",
  green:     "#4ac9b4",
  orange:    "#ef940b",
  purple:    "#D95F7A",
  blueLight: "#e2227b",
};

const CHART_COLORS = [
  PALETTE.navy,
  PALETTE.green,
  PALETTE.orange,
  PALETTE.purple,
  PALETTE.blueLight,
];

const NEUTRAL = "#babab7";

// ─── Opciones base Bar ─────────────────────────────────────────
const barBaseOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: PALETTE.navy,
      titleColor: "#fff",
      bodyColor: "#cde0f0",
      padding: 10,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: "#888780",
        font: { size: 11 },
        maxRotation: 30,
        autoSkip: false,
      },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
      border: { display: false },
      ticks: { color: "#888780", font: { size: 11 } },
    },
  },
};

// ─── Opciones base Doughnut / Pie ──────────────────────────────
const arcBaseOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: PALETTE.navy,
      titleColor: "#fff",
      bodyColor: "#cde0f0",
      padding: 10,
      cornerRadius: 4,
    },
  },
};

// ─── Leyenda ───────────────────────────────────────────────────
const ChartLegend = ({ items }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", mb: 1.25 }}>
    {items.map(({ color, label }) => (
      <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ─── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      backgroundColor: accent ? PALETTE.navy : "background.paper",
      border: accent ? "none" : "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: accent ? "#fff" : "text.primary",
        display: "block",
        mb: 0.75,
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 600,
        color: accent ? "#fff" : PALETTE.navy,
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography
        variant="caption"
        sx={{
          color: accent ? "#e3e1e1" : "text.secondary",
          mt: 0.5,
          display: "block",
        }}
      >
        {sub}
      </Typography>
    )}
  </Paper>
);

// ─── Chart Card ────────────────────────────────────────────────
const ChartCard = ({ title, legend, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        color: "text.secondary",
        mb: 0.75,
        letterSpacing: "0.02em",
      }}
    >
      {title}
    </Typography>

    {legend && <ChartLegend items={legend} />}

    {/* Altura fija para el canvas — todas las cards tienen la misma */}
    <Box sx={{ position: "relative", height: 240 }}>
      {children}
    </Box>
  </Paper>
);

// ─── Componente principal ──────────────────────────────────────
const AdminDashboardPanel = ({
  projects = [],
  organizations = [],
  selectedOrg,
  selectedProject,
  selectedPeriod,
}) => {

  // ── Estudiantes desde storage ────────────────────────────────
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadStudents = () => {
      const data = storageService.getEstudiantes() || [];
      setStudents(data);
    };
    loadStudents();
    window.addEventListener("storageUpdated", loadStudents);
    return () => window.removeEventListener("storageUpdated", loadStudents);
  }, []);

  // ── Estudiantes filtrados ────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedOrg) {
        if (Array.isArray(s.enrollments)) {
          const hasOrg = s.enrollments.some(
            (e) => Number(e.id_organizacion) === Number(selectedOrg)
          );
          if (!hasOrg) return false;
        } else if (Number(s.id_organizacion) !== Number(selectedOrg)) {
          return false;
        }
      }

      if (selectedProject) {
        if (Array.isArray(s.enrollments)) {
          const hasProject = s.enrollments.some(
            (e) => Number(e.id_proyecto) === Number(selectedProject)
          );
          if (!hasProject) return false;
        } else if (Number(s.id_proyecto) !== Number(selectedProject)) {
          return false;
        }
      }

      if (selectedPeriod) {
        const matchesPeriod = (projId) => {
          const project = projects.find(
            (p) => Number(p.id_proyecto) === Number(projId)
          );
          return project?.periodo === selectedPeriod;
        };
        if (Array.isArray(s.enrollments)) {
          const hasPeriod = s.enrollments.some((e) =>
            matchesPeriod(e.id_proyecto)
          );
          if (!hasPeriod) return false;
        } else {
          if (!matchesPeriod(s.id_proyecto)) return false;
        }
      }

      return true;
    });
  }, [students, projects, selectedOrg, selectedProject, selectedPeriod]);

  // ── Inscritos por proyecto ───────────────────────────────────
  const projectEnrollmentCounts = useMemo(() => {
    return projects.map((proj) => {
      const count = filteredStudents.filter((s) => {
        if (Array.isArray(s.enrollments)) {
          return s.enrollments.some(
            (e) => Number(e.id_proyecto) === Number(proj.id_proyecto)
          );
        }
        return Number(s.id_proyecto) === Number(proj.id_proyecto);
      }).length;

      return {
        nombre: proj.nombre_proyecto,
        inscritos: count,
        cupo: Number(proj.cupo_estudiantes),
        id: proj.id_proyecto,
      };
    });
  }, [filteredStudents, projects]);

  // ── KPIs ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = filteredStudents.length;
    const inscritos = filteredStudents.filter((s) => {
      if (Array.isArray(s.enrollments)) return s.enrollments.length > 0;
      return s.id_proyecto !== null && Number(s.id_proyecto) > 0;
    }).length;
    const conversion = total ? ((inscritos / total) * 100).toFixed(1) : 0;
    const topProject = [...projectEnrollmentCounts].sort(
      (a, b) => b.inscritos - a.inscritos
    )[0];
    return {
      total,
      inscritos,
      conversion,
      topProject: topProject?.nombre || "N/A",
    };
  }, [filteredStudents, projectEnrollmentCounts]);

  // ── Top 5 más inscritos ──────────────────────────────────────
  const top5Most = useMemo(() => {
    const sorted = [...projectEnrollmentCounts]
      .sort((a, b) => b.inscritos - a.inscritos)
      .slice(0, 5);
    return {
      labels: sorted.map((p) => p.nombre),
      datasets: [
        {
          label: "Inscritos",
          data: sorted.map((p) => p.inscritos),
          backgroundColor: PALETTE.navy,
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [projectEnrollmentCounts]);

  // ── Top 5 menos inscritos ────────────────────────────────────
  const top5Least = useMemo(() => {
    const sorted = [...projectEnrollmentCounts]
      .sort((a, b) => a.inscritos - b.inscritos)
      .slice(0, 5);
    return {
      labels: sorted.map((p) => p.nombre),
      datasets: [
        {
          label: "Inscritos",
          data: sorted.map((p) => p.inscritos),
          backgroundColor: PALETTE.orange,
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [projectEnrollmentCounts]);

  // ── Cupos disponibles ────────────────────────────────────────
  
  const capacityData = useMemo(() => {

    // 1️⃣ Determinar qué proyectos entran en el cálculo según filtros
    let relevantProjects = projects;

    if (selectedProject) {
      relevantProjects = projects.filter(
        (p) => Number(p.id_proyecto) === Number(selectedProject)
      );
    } else {
      if (selectedOrg) {
        relevantProjects = relevantProjects.filter(
          (p) => Number(p.id_organizacion) === Number(selectedOrg)
        );
      }

      if (selectedPeriod) {
        relevantProjects = relevantProjects.filter(
          (p) => p.periodo === selectedPeriod
        );
      }
    }

    // 2️⃣ Calcular cupo total SOLO de esos proyectos
    const totalCapacity = relevantProjects.reduce(
      (acc, p) => acc + Number(p.cupo_estudiantes || 0),
      0
    );

    // 3️⃣ Calcular inscritos SOLO en esos proyectos
    const totalInscritos = relevantProjects.reduce((acc, proj) => {
      const count = filteredStudents.filter((s) => {
        if (Array.isArray(s.enrollments)) {
          return s.enrollments.some(
            (e) => Number(e.id_proyecto) === Number(proj.id_proyecto)
          );
        }
        return Number(s.id_proyecto) === Number(proj.id_proyecto);
      }).length;

      return acc + count;
    }, 0);

    return {
      labels: ["Inscritos", "Disponibles"],
      datasets: [
        {
          data: [
            totalInscritos,
            Math.max(totalCapacity - totalInscritos, 0),
          ],
          backgroundColor: [PALETTE.navy, PALETTE.blueLight],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };

  }, [
    projects,
    filteredStudents,
    selectedProject,
    selectedOrg,
    selectedPeriod,
  ]);

  // ── Distribución por organización ────────────────────────────
  const organizationDistribution = useMemo(() => {
    const orgMap = {};
    filteredStudents.forEach((s) => {
      if (Array.isArray(s.enrollments)) {
        s.enrollments.forEach((e) => {
          orgMap[e.id_organizacion] = (orgMap[e.id_organizacion] || 0) + 1;
        });
      } else if (s.id_organizacion) {
        orgMap[s.id_organizacion] = (orgMap[s.id_organizacion] || 0) + 1;
      }
    });
    const labels = Object.keys(orgMap).map((id) => {
      const org = organizations.find(
        (o) => Number(o.id_organizacion) === Number(id)
      );
      return org ? org.nombre_osf : `Org ${id}`;
    });
    return {
      labels,
      datasets: [
        {
          data: Object.values(orgMap),
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
      total: filteredStudents.length,
    };
  }, [filteredStudents, organizations]);

  // ── Inscritos por periodo ────────────────────────────────────
  const enrollmentByPeriod = useMemo(() => {
    const periodMap = {};
    filteredStudents.forEach((s) => {
      const countPeriod = (projId) => {
        const project = projects.find(
          (p) => Number(p.id_proyecto) === Number(projId)
        );
        const periodo = project?.periodo || "Sin periodo";
        periodMap[periodo] = (periodMap[periodo] || 0) + 1;
      };
      if (Array.isArray(s.enrollments)) {
        s.enrollments.forEach((e) => countPeriod(e.id_proyecto));
      } else if (s.id_proyecto) {
        countPeriod(s.id_proyecto);
      }
    });
    const entries = Object.entries(periodMap);
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          label: "Inscritos",
          data: entries.map(([, v]) => v),
          backgroundColor: entries.map(
            (_, i) => CHART_COLORS[i % CHART_COLORS.length]
          ),
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [filteredStudents, projects]);

  // ── Conversión ───────────────────────────────────────────────
  const conversionData = useMemo(() => {
    const inscritos = kpis.inscritos;
    const noInscritos = kpis.total - inscritos;
    return {
      labels: ["Inscritos", "Sin inscribir"],
      datasets: [
        {
          data: [inscritos, noInscritos],
          backgroundColor: [PALETTE.green, NEUTRAL],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
      total: kpis.total,
    };
  }, [kpis]);

  // ── Leyendas dinámicas ───────────────────────────────────────
  const orgLegendItems = useMemo(() => {
    return (organizationDistribution.labels || []).map((label, i) => ({
      color: CHART_COLORS[i % CHART_COLORS.length],
      label: `${label} (${organizationDistribution.datasets[0].data[i]})`,
    }));
  }, [organizationDistribution]);

  const periodLegendItems = useMemo(() => {
    return (enrollmentByPeriod.labels || []).map((label, i) => ({
      color: CHART_COLORS[i % CHART_COLORS.length],
      label,
    }));
  }, [enrollmentByPeriod]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 4, width: "100%" }}>

      {/* Encabezado */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, color: PALETTE.navy, mb: 3 }}
      >
        Dashboard Feria de Servicio Social
      </Typography>

      {/* ── KPIs — CSS Grid 4 columnas ─────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 4,
        }}
      >
        <KpiCard
          label="Total de estudiantes"
          value={kpis.total.toLocaleString()}
          sub="registrados en el sistema"
        />
        <KpiCard
          label="Inscritos"
          value={kpis.inscritos.toLocaleString()}
          sub="en un proyecto activo"
          accent
        />
        <KpiCard
          label="Porcentaje de alumnos inscritos"
          value={`${kpis.conversion}%`}
          sub="inscritos / total Check-In"
        />
        <KpiCard
          label="Proyecto con más demanda"
          value={kpis.topProject}
          sub="mayor número de inscritos"
        />
      </Box>

      {/* ── Gráficas — CSS Grid 3 columnas ─────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
        }}
      >
        {/* Top 5 más inscritos */}
        <ChartCard
          title="Top 5 Proyectos con más inscritos"
          legend={[{ color: PALETTE.navy, label: "Inscritos" }]}
        >
          <Bar data={top5Most} options={barBaseOptions} />
        </ChartCard>

        {/* Top 5 menos inscritos */}
        <ChartCard
          title="Top 5 Proyectos con menos inscritos"
          legend={[{ color: PALETTE.orange, label: "Inscritos" }]}
        >
          <Bar data={top5Least} options={barBaseOptions} />
        </ChartCard>

        {/* Cupos disponibles */}
        <ChartCard
          title="Cupos disponibles"
          legend={[
            { color: PALETTE.navy, label: "Inscritos" },
            { color: PALETTE.blueLight, label: "Disponibles" },
          ]}
        >
          {capacityData && (
            <Doughnut
              data={capacityData}
              options={{ ...arcBaseOptions, cutout: "70%" }}
            />
          )}
        </ChartCard>

        {/* Distribución por organización */}
        <ChartCard
          title="Distribución por organización"
          legend={orgLegendItems}
        >
          <Pie data={organizationDistribution} options={arcBaseOptions} />
        </ChartCard>

        {/* Inscritos por periodo */}
        <ChartCard
          title="Inscritos por periodo"
          legend={periodLegendItems}
        >
          <Bar data={enrollmentByPeriod} options={barBaseOptions} />
        </ChartCard>

        {/* Alumnos sin inscripción */}
        <ChartCard
          title="Alumnos sin inscripción"
          legend={[
            { color: PALETTE.green, label: `Inscritos ${kpis.conversion}%` },
            {
              color: NEUTRAL,
              label: `Sin inscribir ${
                kpis.total
                  ? (100 - parseFloat(kpis.conversion)).toFixed(1)
                  : 0
              }%`,
            },
          ]}
        >
          <Doughnut
            data={conversionData}
            options={{ ...arcBaseOptions, cutout: "70%" }}
          />
        </ChartCard>
      </Box>
    </Box>
  );
};

export default AdminDashboardPanel;
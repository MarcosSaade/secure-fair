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
import { Bar, Doughnut } from "react-chartjs-2";
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

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Convierte un nombre largo en siglas/abreviatura para ejes de gráficas.
 * Ej: "1. Participar en una sesión de inducción..." → "Participar en una ses…"
 * Muestra hasta `maxChars` caracteres (sin el número inicial si lo tiene).
 */
const abbreviateLabel = (name, maxChars = 5) => {
  // Quitar prefijo tipo "1. " o "1) "
  const clean = name.replace(/^\d+[)]\s*/, "").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars) + "…";
};

// ─── Callback de tooltip que muestra el nombre completo ────────
// Divide el texto en líneas de máx 40 chars para que el tooltip no lo corte
const wrapText = (text, maxLen = 40) => {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLen) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
};

const fullLabelTitleCallback = (items) => {
  if (!items.length) return [];
  const { dataIndex, dataset } = items[0];
  // fullLabels se guarda dentro del dataset (no en chart.data)
  const full = dataset?.fullLabels?.[dataIndex] ?? items[0].label ?? "";
  return wrapText(full);
};

// Devuelve el color de la barra/segmento activo para el fondo del tooltip
// Lee el color del elemento activo desde context.tooltip.dataPoints
const getActiveColor = (context) => {
  try {
    const dp = context?.tooltip?.dataPoints?.[0];
    if (!dp) return PALETTE.navy;
    const { dataset, dataIndex } = dp;
    const bg = dataset?.backgroundColor;
    if (Array.isArray(bg)) return bg[dataIndex] ?? PALETTE.navy;
    return bg ?? PALETTE.navy;
  } catch {
    return PALETTE.navy;
  }
};

// Opciones de tooltip dinámicas (color igual al elemento hover)
const dynamicTooltip = {
  backgroundColor: (context) => getActiveColor(context),
  titleColor: "#fff",
  bodyColor: "rgba(255,255,255,0.85)",
  padding: 10,
  cornerRadius: 4,
  displayColors: false,
  callbacks: {
    labelColor: (context) => {
      const color = getActiveColor(context);
      return { borderColor: color, backgroundColor: color };
    },
  },
};

// ─── Opciones base Bar vertical ────────────────────────────────
const barBaseOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: dynamicTooltip,
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: "#888780",
        font: { size: 11 },
        maxRotation: 0,
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

// Opciones bar vertical con tooltip de nombre completo + color dinámico
const barOptionsWithFullLabel = {
  ...barBaseOptions,
  plugins: {
    ...barBaseOptions.plugins,
    tooltip: {
      ...dynamicTooltip,
      callbacks: {
        ...dynamicTooltip.callbacks,
        title: fullLabelTitleCallback,
      },
    },
  },
};

// ─── Opciones Bar horizontal (para organizaciones) ─────────────
const barHorizontalOptions = {
  indexAxis: "y",
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: dynamicTooltip,
  },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
      border: { display: false },
      ticks: { color: "#888780", font: { size: 11 } },
      beginAtZero: true,
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: "#888780",
        font: { size: 11 },
        // Las etiquetas ya vienen abreviadas desde el dataset
      },
    },
  },
};

// ─── Opciones base Doughnut ────────────────────────────────────
const arcBaseOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: dynamicTooltip,
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

  // ── Estudiantes desde API (fuente de la verdad) ─────────────
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const apiBase = `/api`;
        const res = await fetch(`${apiBase}/students`);
        const data = await res.json();
        if (data.success) {
          // Normalize: map DB fields to UI field names
          const normalized = data.data.map(s => ({
            ...s,
            id_usuario: s.user_id ?? s.id_usuario,
            nombre: s.full_name || s.nombre || '',
            apellidos: s.apellidos || '',
            carrera: s.carrera || '',
            celular: s.phone || s.celular || '',
            hora_registro: s.hora_registro || '',
            correo: s.correo || '',
            // enrollments already mapped by the API route
            enrollments: (s.enrollments || []).map(e => ({
              id_proyecto: e.project_id ?? e.id_proyecto,
              id_organizacion: e.project?.org_id ?? e.id_organizacion,
              periodo: e.periodo ?? e.fair_period?.name ?? null,
              period_id: e.period_id,
              enrollment_id: e.id ?? e.enrollment_id,
            }))
          }));
          setStudents(normalized);
        } else {
          // Fallback localStorage
          const data2 = storageService.getEstudiantes() || [];
          setStudents(data2);
        }
      } catch (err) {
        console.warn('Dashboard: API no disponible, usando localStorage');
        const data2 = storageService.getEstudiantes() || [];
        setStudents(data2);
      }
    };
    loadStudents();
    window.addEventListener('studentUpdated', loadStudents);
    return () => window.removeEventListener('studentUpdated', loadStudents);
  }, []);

  // ── Estudiantes filtrados ─────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedOrg) {
        if (Array.isArray(s.enrollments)) {
          const hasOrg = s.enrollments.some(
            (e) => Number(e.id_organizacion ?? e.project?.org_id) === Number(selectedOrg)
          );
          if (!hasOrg) return false;
        } else if (Number(s.id_organizacion) !== Number(selectedOrg)) {
          return false;
        }
      }

      if (selectedProject) {
        if (Array.isArray(s.enrollments)) {
          const hasProject = s.enrollments.some(
            (e) => Number(e.id_proyecto ?? e.project_id) === Number(selectedProject)
          );
          if (!hasProject) return false;
        } else if (Number(s.id_proyecto) !== Number(selectedProject)) {
          return false;
        }
      }

      if (selectedPeriod) {
        // selectedPeriod is now a period name string (e.g. "Invierno", "Verano")
        if (Array.isArray(s.enrollments)) {
          const hasPeriod = s.enrollments.some((e) => {
            // Match by periodo string stored in enrollment
            if (e.periodo) return e.periodo === selectedPeriod;
            // Fallback: match via project's periodo
            const project = projects.find(
              (p) => Number(p.id_proyecto ?? p.id) === Number(e.id_proyecto ?? e.project_id)
            );
            return (project?.periodo) === selectedPeriod;
          });
          if (!hasPeriod) return false;
        } else {
          const project = projects.find(
            (p) => Number(p.id_proyecto ?? p.id) === Number(s.id_proyecto)
          );
          if ((project?.periodo) !== selectedPeriod) return false;
        }
      }

      return true;
    });
  }, [students, projects, selectedOrg, selectedProject, selectedPeriod]);

  // ── Inscritos por proyecto ────────────────────────────────────
  const projectEnrollmentCounts = useMemo(() => {
    return projects.map((proj) => {
      const projId = proj.id_proyecto ?? proj.id;
      const count = filteredStudents.filter((s) => {
        if (Array.isArray(s.enrollments)) {
          return s.enrollments.some(
            (e) => Number(e.id_proyecto ?? e.project_id) === Number(projId)
          );
        }
        return Number(s.id_proyecto) === Number(projId);
      }).length;

      return {
        nombre: proj.nombre_proyecto || proj.name || `Proyecto ${projId}`,
        inscritos: count,
        cupo: Number(proj.cupo_estudiantes ?? proj.capacity ?? 0),
        id: projId,
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

  // ── Top 5 proyectos con más inscritos ────────────────────────
  const top5Most = useMemo(() => {
    const sorted = [...projectEnrollmentCounts]
      .sort((a, b) => b.inscritos - a.inscritos)
      .slice(0, 5);
    return {
      labels: sorted.map((p) => abbreviateLabel(p.nombre)),
      datasets: [
        {
          label: "Inscritos",
          data: sorted.map((p) => p.inscritos),
          fullLabels: sorted.map((p) => p.nombre),
          backgroundColor: PALETTE.navy,
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [projectEnrollmentCounts]);

  // ── Top 5 proyectos con menos inscritos ──────────────────────
  const top5Least = useMemo(() => {
    const sorted = [...projectEnrollmentCounts]
      .filter(p => p.inscritos > 0)
      .sort((a, b) => a.inscritos - b.inscritos)
      .slice(0, 5);
    return {
      labels: sorted.map((p) => abbreviateLabel(p.nombre)),
      datasets: [
        {
          label: "Inscritos",
          data: sorted.map((p) => p.inscritos),
          fullLabels: sorted.map((p) => p.nombre),
          backgroundColor: PALETTE.orange,
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [projectEnrollmentCounts]);

  // ── Cupos disponibles ────────────────────────────────────────
  const capacityData = useMemo(() => {
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

    const totalCapacity = relevantProjects.reduce(
      (acc, p) => acc + Number(p.cupo_estudiantes || 0),
      0
    );

    const totalInscritos = relevantProjects.reduce((acc, proj) => {
      const count = filteredStudents.filter((s) => {
        if (Array.isArray(s.enrollments)) {
          return s.enrollments.some(
            (e) => Number(e.id_proyecto || e.project_id) === Number(proj.id_proyecto || proj.id)
          );
        }
        return Number(s.id_proyecto) === Number(proj.id_proyecto || proj.id);
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
  }, [projects, filteredStudents, selectedProject, selectedOrg, selectedPeriod]);

  // ── Inscritos por organización (mapa id → count) ─────────────
  const orgEnrollmentMap = useMemo(() => {
    const orgMap = {};
    filteredStudents.forEach((s) => {
      if (Array.isArray(s.enrollments)) {
        s.enrollments.forEach((e) => {
          const orgId = e.id_organizacion || e.project?.org_id;
          if (orgId !== undefined && orgId !== null) {
            orgMap[orgId] = (orgMap[orgId] || 0) + 1;
          }
        });
      } else if (s.id_organizacion) {
        orgMap[s.id_organizacion] = (orgMap[s.id_organizacion] || 0) + 1;
      }
    });
    return orgMap;
  }, [filteredStudents]);

  // ── Top 5 organizaciones con MÁS inscritos (barras horiz.) ───
  const top5OrgsMore = useMemo(() => {
    const entries = Object.entries(orgEnrollmentMap)
      .map(([id, count]) => {
        const org = organizations.find(
          (o) => Number(o.id_organizacion || o.id) === Number(id)
        );
        return { nombre: org ? (org.nombre_osf || org.name) : `Org ${id}`, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      labels: entries.map((e) => abbreviateLabel(e.nombre, 5)),
      datasets: [
        {
          label: "Inscritos",
          data: entries.map((e) => e.count),
          fullLabels: entries.map((e) => e.nombre),
          backgroundColor: CHART_COLORS.slice(0, entries.length),
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [orgEnrollmentMap, organizations]);

  // ── Top 5 organizaciones con MENOS inscritos (barras horiz.) ─
  const top5OrgsLess = useMemo(() => {
    const entries = Object.entries(orgEnrollmentMap)
      .map(([id, count]) => {
        const org = organizations.find(
          (o) => Number(o.id_organizacion || o.id) === Number(id)
        );
        return { nombre: org ? (org.nombre_osf || org.name) : `Org ${id}`, count };
      })
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    return {
      labels: entries.map((e) => abbreviateLabel(e.nombre, 5)),
      datasets: [
        {
          label: "Inscritos",
          data: entries.map((e) => e.count),
          fullLabels: entries.map((e) => e.nombre),
          backgroundColor: [
            PALETTE.orange,
            PALETTE.purple,
            PALETTE.blueLight,
            "#f4a843",
            "#c94a6a",
          ].slice(0, entries.length),
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    };
  }, [orgEnrollmentMap, organizations]);

  // ── Inscritos por periodo ────────────────────────────────────
  const enrollmentByPeriod = useMemo(() => {
    const periodMap = {};
    filteredStudents.forEach((s) => {
      if (Array.isArray(s.enrollments)) {
        s.enrollments.forEach((e) => {
          // Use the periodo string directly from enrollment (populated from fair_period.name)
          const periodo = e.periodo || null;
          if (periodo) periodMap[periodo] = (periodMap[periodo] || 0) + 1;
        });
      } else if (s.id_proyecto) {
        const project = projects.find(
          (p) => Number(p.id_proyecto || p.id) === Number(s.id_proyecto)
        );
        const periodo = project?.periodo || 'Sin periodo';
        periodMap[periodo] = (periodMap[periodo] || 0) + 1;
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

// Opciones bar horizontal con tooltip de nombre completo + color dinámico
const barHorizWithFullLabel = {
  ...barHorizontalOptions,
  plugins: {
    ...barHorizontalOptions.plugins,
    tooltip: {
      ...dynamicTooltip,
      callbacks: {
        ...dynamicTooltip.callbacks,
        title: fullLabelTitleCallback,
      },
    },
  },
};

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

      {/* ── KPIs ────────────────────────────────────────────── */}
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
          value={kpis.topProject !== "N/A" ? kpis.topProject : ""}
        />
      </Box>

      {/* ── Gráficas — 3 columnas ────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
        }}
      >
        {/* Top 5 organizaciones con más inscritos */}
        <ChartCard
          title="Top 5 Organizaciones con más inscritos"
          legend={[{ color: PALETTE.navy, label: "Inscritos" }]}
        >
          <Bar data={top5OrgsMore} options={barHorizWithFullLabel} />
        </ChartCard>

        {/* Top 5 organizaciones con menos inscritos */}
        <ChartCard
          title="Top 5 Organizaciones con menos inscritos"
          legend={[{ color: PALETTE.orange, label: "Inscritos" }]}
        >
          <Bar data={top5OrgsLess} options={barHorizWithFullLabel} />
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

        {/* Top 5 proyectos con más inscritos */}
        <ChartCard
          title="Top 5 Proyectos con más inscritos"
          legend={[{ color: PALETTE.navy, label: "Inscritos" }]}
        >
          <Bar data={top5Most} options={barOptionsWithFullLabel} />
        </ChartCard>

        {/* Top 5 proyectos con menos inscritos */}
        <ChartCard
          title="Top 5 Proyectos con menos inscritos"
          legend={[{ color: PALETTE.orange, label: "Inscritos" }]}
        >
          <Bar data={top5Least} options={barOptionsWithFullLabel} />
        </ChartCard>

        {/* Inscritos por periodo */}
        <ChartCard
          title="Inscritos por periodo"
          legend={(enrollmentByPeriod.labels || []).map((label, i) => ({
            color: CHART_COLORS[i % CHART_COLORS.length],
            label,
          }))}
        >
          <Bar data={enrollmentByPeriod} options={barBaseOptions} />
        </ChartCard>
      </Box>
    </Box>
  );
};

export default AdminDashboardPanel;
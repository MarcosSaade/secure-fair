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

/* ─── PALETA ───────────────────────────────── */
const PALETTE = {
  navy: "#2479bd",
  blue: "#6AB0D8",
  green: "#4ac9b4",
  orange: "#ef940b",
  purple: "#D95F7A",
  blueLight: "#e2227b",
};

const CHART_COLORS = [
  PALETTE.navy,
  PALETTE.green,
  PALETTE.orange,
  PALETTE.purple,
  PALETTE.blueLight,
];

/* ─── Helpers ──────────────────────────────── */
const abbreviateLabel = (name, maxChars = 5) => {
  const clean = name.replace(/^\d+[)]\s*/, "").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars) + "…";
};

const wrapText = (text, maxLen = 45) => {
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

const fullLabelTitleCallback = (items) => {
  if (!items.length) return [];
  const { dataIndex, dataset } = items[0];
  const full = dataset?.fullLabels?.[dataIndex] ?? items[0].label ?? "";
  return wrapText(full);
};

/* ─── Tooltip dinámico ─────────────────────── */
const dynamicTooltip = {
  backgroundColor: (context) => getActiveColor(context),
  titleColor: "#fff",
  bodyColor: "rgba(255,255,255,0.85)",
  padding: 10,
  cornerRadius: 4,
  displayColors: false,
};

/* ─── Opciones Bar vertical ────────────────── */
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

/* Igual pero con nombre completo en tooltip */
const barOptionsWithFullLabel = {
  ...barBaseOptions,
  plugins: {
    ...barBaseOptions.plugins,
    tooltip: {
      ...dynamicTooltip,
      callbacks: {
        title: fullLabelTitleCallback,
      },
    },
  },
};

/* ─── Opciones Doughnut ────────────────────── */
const arcBaseOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: dynamicTooltip,
  },
};

/* ─── Componentes UI ───────────────────────── */
const ChartLegend = ({ items }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", mb: 1.25 }}>
    {items.map(({ color, label }) => (
      <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: color }} />
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);

const KpiCard = ({ label, value, sub, accent }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      minHeight: 100,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: accent ? PALETTE.navy : "background.paper",
      border: accent ? "none" : "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography
      variant="caption"
      sx={{ color: accent ? "#fff" : "text.primary", display: "block", mb: 0.75 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        fontWeight: 600,
        color: accent ? "#fff" : PALETTE.navy,
        lineHeight: 1.3,
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
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {sub}
      </Typography>
    )}
  </Paper>
);

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
    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
      {title}
    </Typography>
    {legend && <ChartLegend items={legend} />}
    <Box sx={{ position: "relative", height: 240 }}>
      {children}
    </Box>
  </Paper>
);

/* ─── COMPONENTE PRINCIPAL ─────────────────── */
const SocioDashboardPanel = ({
  projects = [],
  organizations = [],
  selectedOrg,
  selectedProject,
  selectedPeriod,
}) => {

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

  /* ─── FILTRO ───────────────────────────── */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesProject = (projId) => {
        const project = projects.find(
          (p) => Number(p.id_proyecto) === Number(projId)
        );
        if (!project) return false;
        if (selectedOrg && Number(project.id_organizacion) !== Number(selectedOrg)) return false;
        if (selectedProject && Number(project.id_proyecto) !== Number(selectedProject)) return false;
        if (selectedPeriod && project.periodo !== selectedPeriod) return false;
        return true;
      };

      if (Array.isArray(s.enrollments)) {
        return s.enrollments.some((e) => matchesProject(e.id_proyecto));
      }
      if (s.id_proyecto) return matchesProject(s.id_proyecto);
      return false;
    });
  }, [students, projects, selectedOrg, selectedProject, selectedPeriod]);

  /* ─── INSCRITOS POR PROYECTO ───────────── */
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
        periodo: proj.periodo,
      };
    });
  }, [filteredStudents, projects]);

  /* ─── KPIs ─────────────────────────────── */
  const kpis = useMemo(() => {
    const inscritos = filteredStudents.length;
    const topProject = [...projectEnrollmentCounts].sort(
      (a, b) => b.inscritos - a.inscritos
    )[0];

    const periodMap = {};
    filteredStudents.forEach((s) => {
      const add = (projId) => {
        const project = projects.find(
          (p) => Number(p.id_proyecto) === Number(projId)
        );
        const periodo = project?.periodo || "Sin periodo";
        periodMap[periodo] = (periodMap[periodo] || 0) + 1;
      };
      if (Array.isArray(s.enrollments)) {
        s.enrollments.forEach((e) => add(e.id_proyecto));
      } else {
        add(s.id_proyecto);
      }
    });

    const topPeriod = Object.entries(periodMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { inscritos, topProject: topProject?.nombre || "N/A", topPeriod };
  }, [filteredStudents, projectEnrollmentCounts, projects]);

  /* ─── CUPOS ─────────────────────────────── */
  const totalCapacity = useMemo(() => {
    let filteredProjects = projects;
    if (selectedProject) {
      filteredProjects = projects.filter(
        (p) => Number(p.id_proyecto) === Number(selectedProject)
      );
    } else if (selectedOrg) {
      filteredProjects = projects.filter(
        (p) => Number(p.id_organizacion) === Number(selectedOrg)
      );
    } else if (selectedPeriod) {
      filteredProjects = projects.filter((p) => p.periodo === selectedPeriod);
    }
    return filteredProjects.reduce(
      (acc, p) => acc + Number(p.cupo_estudiantes || 0),
      0
    );
  }, [projects, selectedProject, selectedOrg, selectedPeriod]);

  const capacityData = useMemo(() => ({
    labels: ["Inscritos", "Disponibles"],
    datasets: [
      {
        data: [kpis.inscritos, Math.max(totalCapacity - kpis.inscritos, 0)],
        fullLabels: ["Inscritos", "Disponibles"],
        backgroundColor: [PALETTE.navy, PALETTE.blueLight],
        borderWidth: 0,
      },
    ],
  }), [kpis.inscritos, totalCapacity]);

  /* ─── TOP 5 MÁS INSCRITOS ──────────────── */
  const top5Most = useMemo(() => {
    const sorted = [...projectEnrollmentCounts]
      .sort((a, b) => b.inscritos - a.inscritos)
      .slice(0, 5);
    return {
      labels: sorted.map((p) => abbreviateLabel(p.nombre)),
      datasets: [{
        label: "Inscritos",
        data: sorted.map((p) => p.inscritos),
        fullLabels: sorted.map((p) => p.nombre),
        backgroundColor: PALETTE.navy,
        borderRadius: 0,
        borderSkipped: false,
      }],
    };
  }, [projectEnrollmentCounts]);

  /* ─── INSCRITOS POR PERIODO ────────────── */
  const periodChartData = useMemo(() => {
    const periodMap = projectEnrollmentCounts.reduce((acc, p) => {
      if (!p.periodo) return acc;
      acc[p.periodo] = (acc[p.periodo] || 0) + p.inscritos;
      return acc;
    }, {});
    const entries = Object.entries(periodMap);
    return {
      labels: entries.map(([k]) => k),
      datasets: [{
        label: "Inscritos",
        data: entries.map(([, v]) => v),
        fullLabels: entries.map(([k]) => k),
        backgroundColor: entries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderRadius: 0,
        borderSkipped: false,
      }],
    };
  }, [projectEnrollmentCounts]);

  /* ─── RENDER ────────────────────────────── */
  return (
    <Box sx={{ mt: 4, width: "100%" }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: PALETTE.navy, mb: 3 }}>
        Dashboard Feria de Servicio Social
      </Typography>

      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 4 }}>
        <KpiCard label="Inscritos" value={kpis.inscritos} accent />
        <KpiCard label="Proyecto con más demanda" value={kpis.topProject} />
        <KpiCard label="Periodo con más demanda" value={kpis.topPeriod} />
      </Box>

      {/* Gráficas */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>

        {!selectedProject && (
          <ChartCard
            title="Top 5 Proyectos con más inscritos"
            legend={[{ color: PALETTE.navy, label: "Inscritos" }]}
          >
            <Bar data={top5Most} options={barOptionsWithFullLabel} />
          </ChartCard>
        )}

        <ChartCard
          title="Cupos disponibles"
          legend={[
            { color: PALETTE.navy, label: "Inscritos" },
            { color: PALETTE.blueLight, label: "Disponibles" },
          ]}
        >
          <Doughnut
            data={capacityData}
            options={{ ...arcBaseOptions, cutout: "70%" }}
          />
        </ChartCard>

        {!selectedProject && (
          <ChartCard
            title="Inscritos por periodo"
            legend={periodChartData.labels.map((label, i) => ({
              color: CHART_COLORS[i % CHART_COLORS.length],
              label,
            }))}
          >
            <Bar data={periodChartData} options={barBaseOptions} />
          </ChartCard>
        )}

      </Box>
    </Box>
  );
};

export default SocioDashboardPanel;
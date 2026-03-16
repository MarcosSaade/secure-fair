import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, useTheme } from "@mui/material";
import { projects } from "../projects";
import { organizations } from "../organization";
import ProjectsTable from "../../components/ProjectsTable";

const StudentSlots = () => {
	const navigate = useNavigate();
	const theme = useTheme();
	const [search, setSearch] = useState("");
	const [orgFilter, setOrgFilter] = useState("");

	const handleRegister = (project) => {
		navigate("/student/enrollform", { state: { project } });
	};

	// Get org name by orgID
	const getOrgName = (orgID) => {
		const org = organizations.find((o) => o.orgID === orgID);
		return org ? org.name_org : "";
	};

	// Filter projects by name and organization
	const filteredProjects = projects.filter((project) => {
		const matchesName = project.name.toLowerCase().includes(search.toLowerCase());
		const matchesOrg = orgFilter ? project.orgID === Number(orgFilter) : true;
		return matchesName && matchesOrg;
	});

	return (
		<Box>
			{/* Title */}
			<Typography
				variant="h4"
				sx={{
					fontWeight: 700,
					color: theme.palette.primary.main,
					mb: 3,
					fontSize: { xs: '1.5rem', sm: '2rem' },
				}}
			>
				Elige tu Servicio Social
			</Typography>

			{/* Description */}
			<Typography
				variant="body1"
				sx={{
					color: theme.palette.text.secondary,
					mb: 4,
					fontSize: { xs: '0.9rem', sm: '1rem' },
				}}
			>
				Aquí puedes ver todos los proyectos disponibles para registrarte. Usa el buscador para encontrar proyectos por nombre o filtra por organización.
				Una vez que encuentres un proyecto que te interese, haz clic en "Registrar" para inscribirte.
				Después debes ingresar el código que te proporcione el Socio-Formador.
			</Typography>

			{/* Search Filters */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
					gap: 2,
					mb: 4,
				}}
			>
				<TextField
					fullWidth
					label="Buscar por nombre"
					variant="outlined"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{
						'& .MuiOutlinedInput-root': {
							fontSize: '1rem',
						},
					}}
				/>
				<TextField
					fullWidth
					label="Filtrar por organización"
					select
					value={orgFilter}
					onChange={(e) => setOrgFilter(e.target.value)}
					sx={{
						'& .MuiOutlinedInput-root': {
							fontSize: '1rem',
						},
					}}
				>
					<MenuItem value="">Todas</MenuItem>
					{organizations.map((org) => (
						<MenuItem key={org.orgID} value={org.orgID}>
							{org.name_org}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{/* Projects Table/Cards */}
			<ProjectsTable 
				projects={filteredProjects} 
				onRegister={handleRegister}
				getOrgName={getOrgName}
			/>
		</Box>
	);
};

export default StudentSlots;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, IconButton, TextField, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { projects } from "../projects";
import { organizations } from "../organization";

const StudentSlots = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [orgFilter, setOrgFilter] = useState("");

	const handleProfile = () => {
		navigate("/student/profile");
	};

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
		<Box sx={{ p: 4 }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Typography variant="h4" sx={{ fontWeight: 600, color: "#2479bd" }}>
					Proyectos Disponibles
				</Typography>
				<IconButton onClick={handleProfile} color="primary">
					<AccountCircleIcon fontSize="large" />
				</IconButton>
			</Box>
			<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
				<TextField
					label="Buscar por nombre"
					variant="outlined"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="small"
				/>
				<TextField
					label="Filtrar por organización"
					select
					value={orgFilter}
					onChange={(e) => setOrgFilter(e.target.value)}
					size="small"
					sx={{ minWidth: 200 }}
				>
					<MenuItem value="">Todas</MenuItem>
					{organizations.map((org) => (
						<MenuItem key={org.orgID} value={org.orgID}>{org.name_org}</MenuItem>
					))}
				</TextField>
			</Box>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Nombre</TableCell>
							<TableCell>Descripción</TableCell>
							<TableCell>Duración</TableCell>
							<TableCell>Horas Acreditadas</TableCell>
							<TableCell>Lugar</TableCell>
							<TableCell>Organización</TableCell>
							<TableCell>Cupo</TableCell>
							<TableCell>Acción</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredProjects.map((project) => (
							<TableRow key={project.project_id}>
								<TableCell>{project.name}</TableCell>
								<TableCell>{project.description}</TableCell>
								<TableCell>{project.duration}</TableCell>
								<TableCell>{project.horas_acreditadas ?? <span style={{color:'#aaa'}}>N/A</span>}</TableCell>
								<TableCell>{project.lugar || <span style={{color:'#aaa'}}>N/A</span>}</TableCell>
								<TableCell>{getOrgName(project.orgID)}</TableCell>
								<TableCell>
									{project.registered ? `${project.registered}/${project.capacity}` : `0/${project.capacity}`}
								</TableCell>
								<TableCell>
									<Button
										variant="contained"
										color="primary"
										onClick={() => handleRegister(project)}
									>
										Registrarse
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default StudentSlots;

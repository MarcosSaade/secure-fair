import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';

/**
 * ProjectsTable
 * 
 * Responsive component that shows:
 * - Card view on mobile (large, easy to read)
 * - Table view on desktop
 */
const ProjectsTable = ({ projects = [], organizations = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Helper: get total capacity (supports both field names)
  const getCapacity = (project) =>
    Number(project.cupo_estudiantes ?? project.capacity ?? 0);

  // Helper: get inscribed count
  const getInscritos = (project) =>
    Number(project.inscritos ?? 0);

  // Helper function to calculate available slots
  const getAvailableSlots = (project) =>
    Math.max(0, getCapacity(project) - getInscritos(project));

  const getOrgName = (orgId) => {
    const org = organizations.find(
      (o) => Number(o.id_organizacion ?? o.id) === Number(orgId)
    );
    return org?.nombre_osf || org?.name || 'N/A';
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {projects.map((project) => {
          const availableSlots = getAvailableSlots(project);
          const isFull = availableSlots === 0;

          return (
            <Card
              key={project.id_proyecto || project.id}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                opacity: isFull ? 0.7 : 1,
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(27, 95, 145, 0.15)',
                  transform: isFull ? 'none' : 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Project Name */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.secondary.main,
                    mb: 2,
                    fontSize: '1.3rem',
                  }}
                >
                  {project.nombre_proyecto || project.name}
                </Typography>

                {/* Description */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: 'block',
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: '0.85rem',
                    }}
                  >
                    Descripción
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {project.descripcion_proyecto || project.descripcion || project.description || 'Sin descripción'}
                  </Typography>
                </Box>

                {/* Details Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2.5,
                    mb: 3,
                  }}
                >
                  {/* Duration */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Duración
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {project.duracion || project.duration || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Hours */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Horas
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {project.horas_acreditadas ?? project.accredited_hours ?? 'N/A'}
                    </Typography>
                  </Box>

                  {/* Period */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Periodo
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {project.periodo || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Location */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Lugar
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: '0.95rem',
                      }}
                    >
                      {project.lugar || project.location || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Organization */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Organización
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: '0.95rem',
                      }}
                    >
                      {getOrgName(project.id_organizacion ?? project.org_id)}
                    </Typography>
                  </Box>

                  {/* Capacity */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Cupo
                    </Typography>
                    <Chip
                      label={`${availableSlots}`}
                      size="small"
                      sx={{
                        backgroundColor: !isFull
                          ? `${theme.palette.success.main}20`
                          : `${theme.palette.error.main}20`,
                        color: !isFull
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        height: '28px',
                      }}
                    />
                  </Box>

                  {/* Availability */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.75,
                        fontSize: '0.8rem',
                      }}
                    >
                      Disponibilidad
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: !isFull ? theme.palette.success.main : theme.palette.error.main,
                        fontSize: '1rem',
                      }}
                    >
                      {isFull ? 'Lleno' : 'Abierto'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }

  // Desktop Table View
  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
      <Table sx={{ minWidth: 1200, tableLayout: 'fixed' }}>
        <TableHead sx={{ backgroundColor: `${theme.palette.primary.main}10` }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: '180px' }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '220px' }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '100px' }}>Duración</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '100px' }}>Horas</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '100px' }}>Periodo</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '120px' }}>Lugar</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '150px' }}>Organización</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '80px' }} align="center">Cupo</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '120px' }} align="center">Disponibilidad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow><TableCell colSpan={9} align="center" sx={{ py: 10, color: 'text.secondary' }}>No hay proyectos disponibles con estos filtros</TableCell></TableRow>
          ) : projects.map((project) => {
            const availableSlots = getAvailableSlots(project);
            const isFull = availableSlots === 0;

            return (
              <TableRow
                key={project.id_proyecto || project.id}
                sx={{
                  opacity: isFull ? 0.6 : 1,
                  '&:hover': {
                    backgroundColor: isFull ? 'transparent' : `${theme.palette.primary.main}08`,
                  },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  {project.nombre_proyecto || project.name}
                </TableCell>
                <TableCell>
                  <span style={{ display: 'block', wordBreak: 'break-word' }}>
                    {project.descripcion_proyecto || project.descripcion || project.description}
                  </span>
                </TableCell>
                <TableCell>
                  {project.duracion || project.duration || <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {project.horas_acreditadas ?? project.accredited_hours ?? <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell>
                  {project.periodo || <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell>
                  {project.lugar || project.location || <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell>
                  {getOrgName(project.id_organizacion ?? project.org_id)}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${availableSlots}`}
                    size="small"
                    sx={{
                      backgroundColor: !isFull
                        ? `${theme.palette.success.main}20`
                        : `${theme.palette.error.main}20`,
                      color: !isFull ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontWeight: 600, color: !isFull ? theme.palette.success.main : theme.palette.error.main }}>
                    {isFull ? 'Lleno' : 'Abierto'}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectsTable;
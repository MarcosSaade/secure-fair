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
const ProjectsTable = ({ projects = [], getOrgName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Helper function to calculate available slots
  const getAvailableSlots = (project) => {
    return Math.max(0, project.capacity - (project.registered || 0));
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
              key={project.project_id}
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
                  {project.name}
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
                    {project.description}
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
                      {project.duration}
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
                      {project.horas_acreditadas ?? 'N/A'}
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
                      {project.lugar || 'N/A'}
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
                      {getOrgName(project.orgID)}
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
                        backgroundColor:
                          !isFull
                            ? `${theme.palette.success.main}20`
                            : `${theme.palette.error.main}20`,
                        color:
                          !isFull
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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 1000 }}>
        <TableHead 
          sx={{ 
            backgroundColor: `${theme.palette.primary.main}15`,
          }}
        >
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Nombre
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Descripción
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Duración
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Horas Acreditadas
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Lugar
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Organización
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>
              Cupo
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }} align="center">
              Disponibilidad
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => {
            const availableSlots = getAvailableSlots(project);
            const isFull = availableSlots === 0;

            return (
              <TableRow
                key={project.project_id}
                sx={{
                  opacity: isFull ? 0.6 : 1,
                  '&:hover': {
                    backgroundColor: isFull ? 'transparent' : `${theme.palette.primary.main}08`,
                  },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '& td': {
                    py: 2.5,
                    fontSize: '0.95rem',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  {project.name}
                </TableCell>
                <TableCell sx={{ maxWidth: 150 }}>
                  {project.description}
                </TableCell>
                <TableCell>{project.duration}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {project.horas_acreditadas ?? <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell>
                  {project.lugar || <span style={{ color: '#aaa' }}>N/A</span>}
                </TableCell>
                <TableCell>{getOrgName(project.orgID)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${availableSlots}`}
                    size="small"
                    sx={{
                      backgroundColor:
                        !isFull
                          ? `${theme.palette.success.main}20`
                          : `${theme.palette.error.main}20`,
                      color:
                        !isFull
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: !isFull ? theme.palette.success.main : theme.palette.error.main,
                    }}
                  >
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
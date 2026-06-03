import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Box, Paper, Typography, Button, Chip } from "@mui/material";
import { CheckCircle, School, Business, Timer, Place, Stars } from "@mui/icons-material";

const PERIOD_COLORS = {
  'Invierno': { bg: '#dbeafe', color: '#1d4ed8', icon: '❄️' },
  'Verano':   { bg: '#fef9c3', color: '#a16207', icon: '☀️' },
  'Ago-Dic':  { bg: '#dcfce7', color: '#15803d', icon: '🍂' },
  'Ene-Jul':  { bg: '#fce7f3', color: '#9d174d', icon: '🌸' },
};

const getPeriodStyle = (periodo) => {
  return PERIOD_COLORS[periodo] || { bg: '#f3f4f6', color: '#374151', icon: '📅' };
};

const StudentEnrollConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  // Get project info from navigation state (set by EnrollForm.js)
  const projectInfo = location.state?.projectInfo || null;

  useEffect(() => {
    // Trigger animation after mount
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleGoHome = () => {
    navigate("/student/slots");
  };

  const handleGoProfile = () => {
    navigate("/student/profile");
  };

  const periodoStyle = getPeriodStyle(projectInfo?.periodo || projectInfo?.fair_period?.name);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: { xs: 4, sm: 8 }, pb: 4 }}>
        {/* Main confirmation card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(5, 150, 105, 0.2)',
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            opacity: show ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Green header with checkmark */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)',
              p: { xs: 4, sm: 5 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative background circles */}
            <Box sx={{
              position: 'absolute', top: -40, right: -40,
              width: 160, height: 160, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
            }} />
            <Box sx={{
              position: 'absolute', bottom: -50, left: -20,
              width: 180, height: 180, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }} />

            <Box sx={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* Animated checkmark circle */}
              <Box sx={{
                width: 90, height: 90, borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '4px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 2.5,
                boxShadow: '0 0 0 8px rgba(255,255,255,0.08)',
                transform: show ? 'scale(1)' : 'scale(0.5)',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
              }}>
                <CheckCircle sx={{ fontSize: 52, color: '#ffffff' }} />
              </Box>

              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '100px', px: 2, py: 0.5, mb: 1.5,
              }}>
                <School sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Servicio Social
                </Typography>
              </Box>

              <Typography sx={{
                color: '#ffffff', fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1,
              }}>
                ¡INSCRITO!
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', mt: 1 }}>
                Tu inscripción fue registrada exitosamente
              </Typography>
            </Box>
          </Box>

          {/* Project details section */}
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            {projectInfo ? (
              <>
                {/* Project name */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46', flex: 1 }}>
                      {projectInfo.nombre_proyecto || projectInfo.name}
                    </Typography>
                    {(projectInfo.periodo || projectInfo.fair_period?.name) && (
                      <Chip
                        label={`${periodoStyle.icon} ${projectInfo.periodo || projectInfo.fair_period?.name}`}
                        size="small"
                        sx={{
                          backgroundColor: periodoStyle.bg,
                          color: periodoStyle.color,
                          fontWeight: 700, fontSize: '0.78rem',
                        }}
                      />
                    )}
                  </Box>
                  {(projectInfo.description || projectInfo.descripcion) && (
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {projectInfo.description || projectInfo.descripcion}
                    </Typography>
                  )}
                </Box>

                {/* Project details grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2, mb: 3,
                }}>
                  {(projectInfo.organization?.name || projectInfo.nombre_osf) && (
                    <Box sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.5, borderRadius: 2, backgroundColor: '#f9fafb',
                    }}>
                      <Business sx={{ fontSize: 18, color: '#059669', mt: 0.3, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Organización</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                          {projectInfo.organization?.name || projectInfo.nombre_osf}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {(projectInfo.accredited_hours || projectInfo.horas_acreditadas) && (
                    <Box sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.5, borderRadius: 2, backgroundColor: '#f9fafb',
                    }}>
                      <Stars sx={{ fontSize: 18, color: '#059669', mt: 0.3, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Horas Acreditadas</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                          {projectInfo.accredited_hours || projectInfo.horas_acreditadas} hrs
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {(projectInfo.duration || projectInfo.duracion) && (
                    <Box sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.5, borderRadius: 2, backgroundColor: '#f9fafb',
                    }}>
                      <Timer sx={{ fontSize: 18, color: '#059669', mt: 0.3, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duración</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                          {projectInfo.duration || projectInfo.duracion}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {(projectInfo.location || projectInfo.lugar) && (
                    <Box sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.5, borderRadius: 2, backgroundColor: '#f9fafb',
                    }}>
                      <Place sx={{ fontSize: 18, color: '#059669', mt: 0.3, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lugar</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                          {projectInfo.location || projectInfo.lugar}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Has quedado inscrito en el servicio social.
                </Typography>
              </Box>
            )}

            {/* Info note */}
            <Box sx={{
              p: 2, borderRadius: 2,
              backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
              mb: 3,
            }}>
              <Typography variant="body2" sx={{ color: '#065f46', textAlign: 'center' }}>
                💡 Puedes revisar tu inscripción en cualquier momento desde tu perfil
              </Typography>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoHome}
                sx={{
                  borderColor: '#059669', color: '#059669', fontWeight: 600,
                  '&:hover': { borderColor: '#047857', backgroundColor: '#ecfdf5' },
                }}
              >
                Ver más proyectos
              </Button>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGoProfile}
                sx={{
                  background: 'linear-gradient(135deg, #047857, #059669)',
                  fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #065f46, #047857)',
                    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.5)',
                  },
                }}
              >
                Ver mi perfil
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentEnrollConfirm;
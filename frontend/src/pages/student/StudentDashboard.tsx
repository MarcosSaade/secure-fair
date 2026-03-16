/**
 * StudentDashboard
 *
 * Student home page:
 *   - Lists available time slots for enrollment
 *   - Shows enrollment status and QR code for check-in
 *   - Code redemption form to enroll in a slot
 */

import { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import QRCode from 'react-qr-code';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';

interface TimeSlot {
  id: number;
  project_id: number;
  project_name: string;
  start_time: string;
  end_time: string;
  current_enrollments: number;
  max_capacity: number;
  status: string;
}

interface QRToken {
  token: string;
  expires_at: string;
}

interface Enrollment {
  id: number;
  time_slot_id: number;
  enrolled_at: string;
  signature: string;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const [tab, setTab] = useState(0);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // QR state
  const [qrToken, setQrToken] = useState<QRToken | null>(null);
  const [qrSlotId, setQrSlotId] = useState<number | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Redemption state
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemSlotId, setRedeemSlotId] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsRes, enrollRes] = await Promise.all([
          apiClient.get<TimeSlot[]>('/projects/slots/available'),
          apiClient.get<Enrollment[]>('/enrollments/my-enrollments'),
        ]);
        setSlots(slotsRes.data);
        setEnrollments(enrollRes.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openQR = async (slotId: number) => {
    setQrLoading(true);
    setQrSlotId(slotId);
    try {
      const res = await apiClient.get<QRToken>(`/projects/slots/${slotId}/qr-token`);
      setQrToken(res.data);
      setQrOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar QR');
    } finally {
      setQrLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim() || !redeemSlotId) {
      setRedeemResult({ success: false, message: 'Por favor ingresa el código y selecciona un slot.' });
      return;
    }
    setRedeemLoading(true);
    setRedeemResult(null);
    try {
      await apiClient.post('/enrollments/', {
        time_slot_id: parseInt(redeemSlotId),
        enrollment_code: redeemCode.trim().toUpperCase(),
      });
      setRedeemResult({ success: true, message: '¡Inscripción exitosa! Tu recibo ha sido generado.' });
      setRedeemCode('');
      // Refresh enrollments
      const res = await apiClient.get<Enrollment[]>('/enrollments/my-enrollments');
      setEnrollments(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al redimir código';
      setRedeemResult({ success: false, message: msg });
    } finally {
      setRedeemLoading(false);
    }
  };

  const enrolledSlotIds = new Set(enrollments.map((e) => e.time_slot_id));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Secure Fair – Estudiante
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.full_name}
          </Typography>
          <Chip label="ESTUDIANTE" color="secondary" size="small" sx={{ mr: 2 }} />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Portal del Estudiante
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Slots Disponibles" />
          <Tab label={`Mis Inscripciones (${enrollments.length})`} />
          <Tab label="Redimir Código" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Available slots */}
            {tab === 0 && (
              <Grid container spacing={2}>
                {slots.length === 0 ? (
                  <Grid xs={12}>
                    <Typography color="text.secondary">No hay slots disponibles.</Typography>
                  </Grid>
                ) : (
                  slots.map((slot) => {
                    const isFull = slot.current_enrollments >= slot.max_capacity;
                    const isEnrolled = enrolledSlotIds.has(slot.id);
                    return (
                      <Grid xs={12} sm={6} md={4} key={slot.id}>
                        <Card elevation={2}>
                          <CardContent>
                            <Typography fontWeight="bold">{slot.project_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(slot.start_time).toLocaleString('es-MX')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Inscripciones: {slot.current_enrollments}/{slot.max_capacity}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              {isEnrolled ? (
                                <>
                                  <Chip label="Inscrito" color="success" size="small" />
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={qrLoading && qrSlotId === slot.id ? <CircularProgress size={14} /> : <QrCodeIcon />}
                                    onClick={() => openQR(slot.id)}
                                    disabled={qrLoading}
                                  >
                                    QR
                                  </Button>
                                </>
                              ) : (
                                <Chip
                                  label={isFull ? 'Lleno' : 'Disponible'}
                                  color={isFull ? 'error' : 'default'}
                                  size="small"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            )}

            {/* Tab 1: My enrollments */}
            {tab === 1 && (
              <Box>
                {enrollments.length === 0 ? (
                  <Typography color="text.secondary">No tienes inscripciones.</Typography>
                ) : (
                  enrollments.map((e) => (
                    <Card key={e.id} elevation={2} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography fontWeight="bold">Inscripción #{e.id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Slot ID: {e.time_slot_id} • {new Date(e.enrolled_at).toLocaleString('es-MX')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            color: 'text.secondary',
                          }}
                        >
                          Firma: {e.signature.slice(0, 32)}…
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<QrCodeIcon />}
                          sx={{ mt: 1 }}
                          onClick={() => openQR(e.time_slot_id)}
                        >
                          Ver QR de Check-in
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            )}

            {/* Tab 2: Redeem code */}
            {tab === 2 && (
              <Card elevation={2} sx={{ maxWidth: 480 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Redimir Código de Inscripción
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Ingresa el código de 6 caracteres proporcionado por tu socioformador.
                    Debes haber realizado check-in previo.
                  </Typography>

                  {redeemResult && (
                    <Alert severity={redeemResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                      {redeemResult.message}
                    </Alert>
                  )}

                  <TextField
                    label="Código (6 caracteres)"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontFamily: 'monospace' } }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="ID del Slot"
                    value={redeemSlotId}
                    onChange={(e) => setRedeemSlotId(e.target.value)}
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={
                      redeemLoading ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon />
                    }
                    disabled={redeemLoading}
                    onClick={handleRedeem}
                  >
                    Inscribirme
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Código QR de Check-in</DialogTitle>
        <DialogContent>
          {qrToken ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 2 }}>
              <QRCode value={qrToken.token} size={200} />
              <Typography variant="body2" color="text.secondary">
                Expira: {new Date(qrToken.expires_at).toLocaleString('es-MX')}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {qrToken.token}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

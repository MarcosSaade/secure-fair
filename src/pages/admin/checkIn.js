import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  QrCode2 as QrCodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import jsQR from 'jsqr';
import {
  getStudentByMatricula,
  saveCheckIn,
  isAlreadyCheckedIn,
  getCheckedInStudentsToday,
} from '../../services/studentService';

import * as storageService from '../../services/StorageService';

const CheckIn = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null); // 'success' | 'error' | 'denied' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  // Load previously checked in students from service
  useEffect(() => {
    const loadCheckedInStudents = async () => {
      const students = await getCheckedInStudentsToday();
      setCheckedInStudents(students);
    };

    loadCheckedInStudents();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          setCameraActive(true);
          scanQR(); //  empieza solo cuando el video YA tiene tamaño real
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

    useEffect(() => {
    console.log("CheckIn desmontado");
    return () => {
      console.log("Cleanup ejecutado");
      stopCamera();
    };
  }, []);
  // Scan QR Code
  const scanQR = () => {
    console.log("scanQR ejecutándose");
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      requestAnimationFrame(scanQR);
      return;
    }

    if (
      video.readyState !== 4 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      requestAnimationFrame(scanQR);
      return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const code = jsQR(
        imageData.data,
        canvas.width,
        canvas.height
      );

      if (code) {
        stopCamera();
        processQRData(code.data);
        return;
      }
    } catch (err) {
      console.log("Safe scan error:", err);
    }

    requestAnimationFrame(scanQR); //  mejor que setTimeout
  };
  // Check if current time matches registered hour
  const checkTimeValidity = (horaRegistro) => {
    if (!horaRegistro) return { valid: false, message: 'Hora de registro no disponible' };

    const now = new Date();

    // Parse registered hour (e.g., "8:00 AM" or "10:30 PM")
    const [time, period] = horaRegistro.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let registeredHours = hours;
    if (period === 'PM' && hours !== 12) {
      registeredHours += 12;
    } else if (period === 'AM' && hours === 12) {
      registeredHours = 0;
    }

    const registeredDate = new Date();
    registeredDate.setHours(registeredHours, minutes, 0, 0);

    // If current time is AFTER or EQUAL to registered time = valid
    if (now >= registeredDate) {
      return { valid: true, message: 'Hora válida para entrada' };
    } else {
      // Calculate time remaining
      const diffMs = registeredDate - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;

      let timeRemaining = '';
      if (diffHours > 0) {
        timeRemaining = `${diffHours}h ${remainingMins}m`;
      } else {
        timeRemaining = `${remainingMins}m`;
      }

      return {
        valid: false,
        message: `Aún no es su turno. Su hora es a las ${horaRegistro}. Faltan ${timeRemaining}.`,
      };
    }
  };

  // Process scanned QR data
  const processQRData = async (data) => {
    console.log("Procesando QR data:", data);
    try {
      // Parse the JSON from QR
      const qrData = JSON.parse(data);
      console.log("Datos parseados del QR:", qrData);

      // Validate QR data structure
      if (!qrData.username || !qrData.matricula) {
        setCheckInResult('error');
        setErrorMessage('QR inválido: datos incompletos');
        setScannedData(null);
        return;
      }

      // Look up students
     // const currentStudent = JSON.parse(sessionStorage.getItem("studentData"));
     // const estudiantes = storageService.getEstudiantes();

      
     // const estudiante = currentStudent
    //     && currentStudent.matricula?.trim().toUpperCase() === qrData.matricula?.trim().toUpperCase()
    //    ? currentStudent 
     //   : estudiantes.find(s => s.matricula?.trim().toUpperCase() === qrData.matricula?.trim().toUpperCase());
      const estudiantes = storageService.getEstudiantes();
      const estudiante = estudiantes.find(s => s.matricula?.trim().toUpperCase() === qrData.matricula?.trim().toUpperCase());
      console.log("Estudiante encontrado para matrícula:", estudiante);
      console.log("Estudiantes en storage:", storageService.getEstudiantes());


      if (!estudiante) {
        setCheckInResult('error');
        setErrorMessage('Estudiante no registrado');
        setScannedData(qrData);
        return;
      }

      // Check if already checked in today
      const alreadyCheckedIn = await isAlreadyCheckedIn(qrData.matricula);

      if (alreadyCheckedIn) {
        setCheckInResult('error');
        setErrorMessage(`${qrData.nombre} ya fue registrado hoy.`);
        setScannedData(qrData);
        return;
      }

      // Check if time is valid
      const timeCheck = checkTimeValidity(qrData.hora_registro);

      if (!timeCheck.valid) {
        // Time NOT valid - DENIED
        setCheckInResult('denied');
        setErrorMessage(timeCheck.message);
        setScannedData(qrData);
        return;
      }

      // Success - create check-in record
      const checkInRecord = {
        ...qrData,
        timestamp: new Date().toISOString(),
        checkInTime: new Date().toLocaleTimeString('es-ES'),
        checkInDate: new Date().toLocaleDateString('es-ES'),
        status: 'success',
      };

      // Save check-in using service
      await saveCheckIn(checkInRecord);

      // Update state
      const updatedCheckedIn = await getCheckedInStudentsToday();
      setCheckedInStudents(updatedCheckedIn);

      setScannedData(estudiante);
      setCheckInResult('success');
      setErrorMessage('');
    } catch (err) {
      console.error('Error processing QR:', err);
      setCheckInResult('error');
      setErrorMessage('No se pudo procesar el QR. Intenta de nuevo.');
      setScannedData(null);
    }
  };

  // Manual entry
  const handleManualEntry = async (matricula) => {
    if (!matricula.trim()) {
      setErrorMessage('Por favor ingresa una matrícula');
      return;
    }

    console.log("Procesando entrada manual para matrícula:", matricula);

    try {
      // Get student data using service
      const student = await getStudentByMatricula(matricula);
      console.log(storageService.getEstudiantes())

      if (!student) {
        setErrorMessage('Estudiante no encontrado');
        setCheckInResult('error');
        setScannedData(null);
        return;
      }

     // const usuarios = storageService.getUsuarios();
      //const usuario = usuarios.find(u => u.id_usuario === student.id_usuario);
     // const studentData = JSON.parse(sessionStorage.getItem("studentData")) || student;
      const usuario  = JSON.parse(sessionStorage.getItem('user'));

      // Create mock QR data from student info
      const mockData = {
        id_usuario: student.id_usuario,
        username: usuario?.username,
        matricula: student.matricula,
        nombre: student.nombre,
        apellidos: student.apellidos,
        hora_registro: student.hora_registro,
        timestamp: new Date().toISOString(),
      };

      await processQRData(JSON.stringify(mockData));
    } catch (err) {
      console.error('Error in manual entry:', err);
      setErrorMessage('Error al procesar la entrada manual');
      setCheckInResult('error');
    }
  };

  // Reset for next scan
  const handleNextScan = () => {
    setScannedData(null);
    setCheckInResult(null);
    setErrorMessage('');
    startCamera();
  };

  // Get status color
  const getStatusColor = () => {
    if (checkInResult === 'success') return theme.palette.success.main;
    if (checkInResult === 'error') return theme.palette.error.main;
    if (checkInResult === 'denied') return theme.palette.warning.main; // DENIED = YELLOW/ORANGE
    return theme.palette.primary.main;
  };

  const getStatusIcon = () => {
    if (checkInResult === 'success') return <CheckIcon sx={{ fontSize: 48 }} />;
    if (checkInResult === 'denied') return <AccessTimeIcon sx={{ fontSize: 48 }} />; // Clock icon for denied
    if (checkInResult === 'error') return <CloseIcon sx={{ fontSize: 48 }} />;
    return <QrCodeIcon sx={{ fontSize: 48 }} />;
  };

  const getStatusTitle = () => {
    if (checkInResult === 'success') return 'Check-In Exitoso';
    if (checkInResult === 'denied') return 'Aún no es su turno';
    if (checkInResult === 'error') return 'Check-In Denegado';
    return '';
  };
  console.log("CHECKIN NUEVO MONTADO");

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        py: 3,
      }}
    >
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
          sx={{
            mb: 3,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: `${theme.palette.primary.main}15`,
            },
          }}
        >
          Volver
        </Button>

        <Paper
          elevation={10}
          sx={{
            borderRadius: theme.shape.borderRadius,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              p: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Sistema de Check-In
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total registrados hoy: {checkedInStudents.length}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Camera Section */}
            {!scannedData ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {cameraActive ? 'Escanea un QR' : 'Inicia cámara para escanear'}
                </Typography>

                {/* Camera View */}
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 3,
                      bgcolor: '#000',
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: cameraActive ? 'block' : 'none',
                      }}
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ display: 'none' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: '3px dashed rgba(255,255,255,0.5)',
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                 
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={startCamera}
                    sx={{
                      py: 2,
                      mb: 3,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    Abrir Cámara
                  </Button>
                

                {/* Stop Camera Button */}
                {cameraActive && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={stopCamera}
                    sx={{
                      mb: 3,
                      borderColor: theme.palette.divider,
                    }}
                  >
                    Detener Cámara
                  </Button>
                )}

                <Divider sx={{ my: 3 }}>O</Divider>

                {/* Manual Entry */}
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Entrada Manual (Opcional)
                </Typography>
                <ManualEntry onSubmit={handleManualEntry} />

                {/* Error Message */}
                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Alert>
                )}
              </Box>
            ) : (
              // Result Section
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: getStatusColor(),
                  }}
                >
                  {getStatusIcon()}
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: getStatusColor(),
                    mb: 1,
                  }}
                >
                  {getStatusTitle()}
                </Typography>

                {/* Student Info Card */}
                <Card
                  sx={{
                    mb: 3,
                    borderLeft: `4px solid ${getStatusColor()}`,
                    bgcolor: `${getStatusColor()}15`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Nombre
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        {scannedData?.nombre || 'No disponible'}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Matrícula
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        {scannedData?.matricula || 'No disponible'}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Hora de Registro
                      </Typography>
                      <Typography>
                        {scannedData?.hora_registro || 'No disponible'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Error/Denied Message */}
                {errorMessage && (
                  <Alert 
                    severity={checkInResult === 'denied' ? 'warning' : 'error'}
                    sx={{ mb: 3 }}
                  >
                    {errorMessage}
                  </Alert>
                )}

                {/* Next Scan Button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleNextScan}
                  sx={{
                    py: 1.5,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  Siguiente Escaneo
                </Button>
              </Box>
            )}

            {/* Checked In List */}
            {checkedInStudents.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Estudiantes Registrados Hoy
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowDialog(true)}
                      variant="outlined"
                    >
                      Ver Lista ({checkedInStudents.length})
                    </Button>
                  </Box>

                  {/* Preview of last 3 check-ins */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {checkedInStudents.slice(-3).map((student, idx) => (
                      <Card key={idx} sx={{ bgcolor: theme.palette.success.main + '15' }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {student.nombre}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {student.matricula}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: theme.palette.success.main,
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              {student.checkInTime}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Full List Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Estudiantes Registrados Hoy</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            {checkedInStudents.map((student, idx) => (
              <Card key={idx} sx={{ bgcolor: theme.palette.success.main + '15' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {idx + 1}. {student.nombre}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {student.matricula} • {student.checkInTime}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Manual Entry Component
const ManualEntry = ({ onSubmit }) => {
  const [matricula, setMatricula] = useState('');
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        placeholder="Ej: A01659876"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onSubmit(matricula);
            setMatricula('');
          }
        }}
        size="small"
      />
      <Button
        variant="contained"
        onClick={() => {
          onSubmit(matricula);
          setMatricula('');
        }}
        sx={{
          bgcolor: theme.palette.primary.main,
        }}
      >
        Registrar
      </Button>
    </Box>
  );
};

export default CheckIn;
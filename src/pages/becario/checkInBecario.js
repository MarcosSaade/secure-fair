import React from 'react';
import {
  Box,
  Container,

  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import CheckIn from '../../components/CheckIn'

const CheckInBec= () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.primary.light,
      py: 4,
    }}
  >
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/becario')}
        sx={{ mb: 3, color: 'white' }}
      >
        Volver
      </Button>

      {/* SOLO el componente */}
      <CheckIn />
    </Container>
  </Box>
  );
};

export default CheckInBec;
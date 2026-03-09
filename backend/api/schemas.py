from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import time
from typing import Optional, List

# --- Esquemas Base (Compartidos) ---
class UsuarioBase(BaseModel):
    username: str
    correo: EmailStr # Data Validation: Formato de correo válido
    tipo: str # 'Admin', 'Estudiante', 'OSF'
    activo: Optional[bool] = True

class OrganizacionBase(BaseModel):
    nombre_osf: str
    correo_contacto: EmailStr

class ProyectoBase(BaseModel):
    duracion: str
    nombre_proyecto: str
    num_inscritos: Optional[int] = 0
    id_organizacion: int
    correo_organizacion: EmailStr

class EstudianteBase(BaseModel):
    username: str # Redundante pero en ERD
    celular: str
    hora_llegada: time
    hora_salida: time

    # Data Validation (Time Slot): Validación matemática estricta
    @model_validator(mode='after')
    def validar_time_slots(self) -> 'EstudianteBase':
        # La lógica de negocios dicta que no puedes salir antes de llegar
        if self.hora_salida <= self.hora_llegada:
            raise ValueError('Validación de Time Slot fallida: La hora de salida debe ser estrictamente posterior a la hora de llegada.')
        return self

class AdminBase(BaseModel):
    rol: str
    permisos_extra: Optional[str] = None

# --- Esquemas para CREACIÓN (POST) ---
# Incluyen la contraseña
class UsuarioCreate(UsuarioBase):
    contraseña: str

# Esquemas INTEGRADOS para Herencia:
# React enviará un solo objeto con datos de Usuario y datos de Estudiante
class RegistroEstudianteIn(BaseModel):
    datos_usuario: UsuarioCreate
    datos_estudiante: EstudianteBase

class RegistroAdminIn(BaseModel):
    datos_usuario: UsuarioCreate
    datos_admin: AdminBase

# --- Esquemas para RESPUESTA (POST/GET) ---
# Excluyen la contraseña por seguridad y añaden IDs

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    class Config:
        from_attributes = True

class OrganizacionResponse(OrganizacionBase):
    id_organizacion: int
    class Config:
        from_attributes = True

class ProyectoResponse(ProyectoBase):
    id_proyecto: int
    class Config:
        from_attributes = True

class EstudianteResponse(EstudianteBase):
    id_estudiante: int
    # Incluimos los datos del usuario padre para que React tenga todo
    usuario: UsuarioResponse
    class Config:
        from_attributes = True

class AdminResponse(AdminBase):
    id_admin: int
    usuario: UsuarioResponse
    class Config:
        from_attributes = True
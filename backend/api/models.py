from sqlalchemy import Column, Integer, String, Boolean, Time, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# 1. Tabla Intermedia: inscripciones (Estudiantes <-> Proyectos)
# Relación Muchos a Muchos (N:M)
inscripciones = Table(
    'inscripciones', Base.metadata,
    Column('id_estudiante', Integer, ForeignKey('estudiantes.id_estudiante', ondelete="CASCADE"), primary_key=True),
    Column('id_proyecto', Integer, ForeignKey('proyectos.id_proyecto', ondelete="CASCADE"), primary_key=True)
)

# 2. Tabla Intermedia: usuarios_organizaciones (Usuarios <-> Organizaciones)
# Relación Muchos a Muchos (N:M)
usuarios_organizaciones = Table(
    'usuarios_organizaciones', Base.metadata,
    Column('id_usuario', Integer, ForeignKey('usuarios.id_usuario', ondelete="CASCADE"), primary_key=True),
    Column('id_organizacion', Integer, ForeignKey('organizaciones.id_organizacion', ondelete="CASCADE"), primary_key=True)
)

# 3. Tabla Independiente: organizaciones
class Organizacion(Base):
    __tablename__ = 'organizaciones'
    id_organizacion = Column(Integer, primary_key=True, index=True)
    nombre_osf = Column(String(200))
    correo_contacto = Column(String(150))

    # Relación inversa M:N con usuarios
    usuarios_miembros = relationship("Usuario", secondary=usuarios_organizaciones, back_populates="organizaciones_pertenecientes")

# 4. Tabla Padre: usuarios
class Usuario(Base):
    __tablename__ = 'usuarios'
    id_usuario = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    correo = Column(String(150), unique=True, index=True)
    contraseña = Column(String(255))
    tipo = Column(String(20)) # Admin, Estudiante, OSF
    activo = Column(Boolean, default=True)

    # Relaciones Muchos a Muchos
    organizaciones_pertenecientes = relationship("Organizacion", secondary=usuarios_organizaciones, back_populates="usuarios_miembros")
    
    # Relaciones 1:1 de herencia (Hijos)
    detalle_admin = relationship("Admin", back_populates="usuario_padre", uselist=False, cascade="all, delete")
    detalle_estudiante = relationship("Estudiante", back_populates="usuario_padre", uselist=False, cascade="all, delete")

# 5. Tabla Hija: admins (Herencia 1:1 con usuarios)
class Admin(Base):
    __tablename__ = 'admins'
    id_admin = Column(Integer, ForeignKey('usuarios.id_usuario', ondelete="CASCADE"), primary_key=True)
    rol = Column(String(50))
    permisos_extra = Column(String)

    # Relación inversa 1:1
    usuario_padre = relationship("Usuario", back_populates="detalle_admin")

# 6. Tabla Hija: estudiantes (Herencia 1:1 con usuarios / Time Slots)
class Estudiante(Base):
    __tablename__ = 'estudiantes'
    id_estudiante = Column(Integer, ForeignKey('usuarios.id_usuario', ondelete="CASCADE"), primary_key=True)
    # Nota: username en esta tabla es redundante pero está en el ERD. Lo implementamos.
    username = Column(String(100)) 
    celular = Column(String(20))
    hora_llegada = Column(Time)
    hora_salida = Column(Time)

    # Relación inversa 1:1
    usuario_padre = relationship("Usuario", back_populates="detalle_estudiante")
    
    # Relación Muchos a Muchos con Proyectos
    proyectos_actuales = relationship("Proyecto", secondary=inscripciones, back_populates="estudiantes_inscritos")

# 7. Tabla Independiente: proyectos (Mapeo de nombres complejos)
class Proyecto(Base):
    __tablename__ = 'proyectos'
    id_proyecto = Column(Integer, primary_key=True, index=True)
    
    # Usamos comillas dobles para forzar nombres exactos de la Imagen 3 en SQL
    duracion = Column('"Duración de la experiencia:"', String(100)) 
    nombre_proyecto = Column('"Nombre proyecto"', String(200))
    num_inscritos = Column('"# de inscritos"', Integer, default=0)
    id_organizacion = Column('"Id organizacion"', Integer, ForeignKey("organizaciones.id_organizacion"))
    correo_organizacion = Column('"Correo de la organización"', String(150))

    # Relación inversa Muchos a Muchos
    estudiantes_inscritos = relationship("Estudiante", secondary=inscripciones, back_populates="proyectos_actuales")
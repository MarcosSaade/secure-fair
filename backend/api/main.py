from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas
from typing import List

# Crea las tablas si no existen (Ya las creamos, pero es buena práctica)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Base_final - Backend Lead Completa", version="2.0")

# Dependencia para obtener la sesión de DB (Inyección de Dependencias)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === CRUD 1 y 2: ORGANIZACIONES (Independiente) & RELACIÓN M:N (Usuarios_Organizaciones) ===

# CREATE
@app.post("/organizaciones/", response_model=schemas.OrganizacionResponse, tags=["Organizaciones"])
def crear_organizacion(org: schemas.OrganizacionBase, db: Session = Depends(get_db)):
    nueva_org = models.Organizacion(**org.model_dump())
    db.add(nueva_org)
    db.commit()
    db.refresh(nueva_org)
    return nueva_org

# READ (All)
@app.get("/organizaciones/", response_model=List[schemas.OrganizacionResponse], tags=["Organizaciones"])
def listar_organizaciones(db: Session = Depends(get_db)):
    return db.query(models.Organizacion).all()

# DELETE
@app.delete("/organizaciones/{id_org}", tags=["Organizaciones"])
def eliminar_organizacion(id_org: int, db: Session = Depends(get_db)):
    org = db.query(models.Organizacion).filter(models.Organizacion.id_organizacion == id_org).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    db.delete(org)
    db.commit()
    return {"mensaje": "Organización eliminada."}

# ENDPOINT ESPECIAL: Vincular Usuario a Organización (Tabla: usuarios_organizaciones)
@app.post("/organizaciones/{id_org}/miembros/{id_usuario}", tags=["Organizaciones"])
def añadir_miembro_a_organizacion(id_org: int, id_usuario: int, db: Session = Depends(get_db)):
    # 1. Validaciones matemáticas de integridad
    user = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not user: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    org = db.query(models.Organizacion).filter(models.Organizacion.id_organizacion == id_org).first()
    if not org: raise HTTPException(status_code=404, detail="Organización no encontrada")

    # 2. Inserción en tabla intermedia M:N (usuarios_organizaciones)
    try:
        statement = models.usuarios_organizaciones.insert().values(id_usuario=id_usuario, id_organizacion=id_org)
        db.execute(statement)
        db.commit()
        return {"mensaje": f"Usuario {id_usuario} añadido como miembro a organización {id_org}"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="El usuario ya pertenece a esta organización")

# === CRUD 3: PROYECTOS (Mapeo Complejo) ===

@app.post("/proyectos/", response_model=schemas.ProyectoResponse, tags=["Proyectos"])
def crear_proyecto(proy: schemas.ProyectoBase, db: Session = Depends(get_db)):
    # SQLALchemy usará internamente las comillas dobles para los nombres de columna raros
    nuevo_proy = models.Proyecto(**proy.model_dump())
    db.add(nuevo_proy)
    db.commit()
    db.refresh(nuevo_proy)
    return nuevo_proy

@app.get("/proyectos/", response_model=List[schemas.ProyectoResponse], tags=["Proyectos"])
def listar_proyectos(db: Session = Depends(get_db)):
    return db.query(models.Proyecto).all()

# === CRUD 4: USUARIOS (Padre - Genérico) ===

@app.post("/usuarios/", response_model=schemas.UsuarioResponse, tags=["Usuarios"])
def crear_usuario_generico(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Nota de seguridad: Aquí hashearíamos la contraseña en producción
    nuevo_user = models.Usuario(**user.model_dump())
    db.add(nuevo_user)
    db.commit()
    db.refresh(nuevo_user)
    return nuevo_user

@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse], tags=["Usuarios"])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

# === CRUD 5: ESTUDIANTES (Hija - Lógica de Herencia Combinada + Time Slots) ===

# CREATE (Especial: Crea Usuario + Estudiante en una Transacción)
@app.post("/estudiantes/", response_model=schemas.EstudianteResponse, tags=["Estudiantes"], status_code=status.HTTP_201_CREATED)
def registrar_estudiante_completo(data_entrada: schemas.RegistroEstudianteIn, db: Session = Depends(get_db)):
    """
    Endpoint complejo para React: Crea el Usuario padre y luego usa su ID para crear el Estudiante hijo.
    """
    # 1. Crear el registro Padre (Usuario)
    nuevo_usuario = models.Usuario(
        username=data_entrada.datos_usuario.username,
        correo=data_entrada.datos_usuario.correo,
        contraseña=data_entrada.datos_usuario.contraseña, # Seguridad real requerida
        tipo="Estudiante",
        activo=True
    )
    db.add(nuevo_usuario)
    db.commit() # Commiteamos para obtener el id_usuario SERIAL generado
    db.refresh(nuevo_usuario)
    
    # 2. Crear el registro Hijo (Estudiante) usando el ID del padre (Relación 1:1)
    # Las Data Validations (Time Slots) de Pydantic ya corrieron antes de entrar aquí
    nuevo_estudiante = models.Estudiante(
        id_estudiante=nuevo_usuario.id_usuario, # PK compuesta/FK estricta
        username=data_entrada.datos_estudiante.username,
        celular=data_entrada.datos_estudiante.celular,
        hora_llegada=data_entrada.datos_estudiante.hora_llegada,
        hora_salida=data_entrada.datos_estudiante.hora_salida
    )
    db.add(nuevo_estudiante)
    db.commit()
    db.refresh(nuevo_estudiante)
    
    # Devolvemos el esquema integrado EstudianteResponse (que incluye datos del Usuario)
    return nuevo_estudiante

# READ (Especial: JOIN Usuario-Estudiante para React)
@app.get("/estudiantes/", response_model=List[schemas.EstudianteResponse], tags=["Estudiantes"])
def listar_estudiantes_con_datos_usuario(db: Session = Depends(get_db)):
    # Usamos SQLAlchemy para hacer el JOIN y traer datos completos
    estudiantes_completos = db.query(models.Estudiante).join(
        models.Usuario, models.Estudiante.id_estudiante == models.Usuario.id_usuario
    ).all()
    return estudiantes_completos

# === CRUD 6: ADMINS (Hija - Lógica de Herencia Combinada) ===

@app.post("/admins/", response_model=schemas.AdminResponse, tags=["Admins"], status_code=status.HTTP_201_CREATED)
def registrar_admin_completo(data_entrada: schemas.RegistroAdminIn, db: Session = Depends(get_db)):
    # Transacción 1: Crear Usuario
    nuevo_usuario = models.Usuario(**data_entrada.datos_usuario.model_dump(),activo=True)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    # Transacción 2: Crear Admin vinculando ID
    nuevo_admin = models.Admin(
        id_admin=nuevo_usuario.id_usuario, # Herencia PK/FK
        rol=data_entrada.datos_admin.rol,
        permisos_extra=data_entrada.datos_admin.permisos_extra
    )
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    
    return nuevo_admin

# === CRUD 7: INSCRIPCIONES (Relación M:N - Estudiantes-Proyectos) ===

# ACCIÓN: Inscribir (C) -> POST /inscripciones/
@app.post("/inscripciones/", tags=["Inscripciones"])
def inscribir_estudiante_en_proyecto(id_estudiante: int, id_proyecto: int, db: Session = Depends(get_db)):
    # 1. Validaciones matemáticas estricta de FKs (proteger base de datos)
    est = db.query(models.Estudiante).filter(models.Estudiante.id_estudiante == id_estudiante).first()
    if not est: raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    proy = db.query(models.Proyecto).filter(models.Proyecto.id_proyecto == id_proyecto).first()
    if not proy: raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # 2. Inserción en tabla intermedia (inscripciones)
    try:
        # Usamos sentencias SQL directas de SQLAlchemy Core para tablas intermedias
        statement = models.inscripciones.insert().values(id_estudiante=id_estudiante, id_proyecto=id_proyecto)
        db.execute(statement)
        db.commit()
        return {"mensaje": f"Inscripción exitosa: Estudiante {id_estudiante} inscrito en proyecto {id_proyecto}"}
    except Exception:
        # Rollback en caso de duplicidad o error de integridad (Ya está inscrito)
        db.rollback()
        raise HTTPException(status_code=400, detail="El estudiante ya está inscrito en este proyecto o hubo un error de integridad.")

# ACCIÓN: Desvincular (D) -> DELETE /inscripciones/
@app.delete("/inscripciones/", tags=["Inscripciones"])
def desvincular_estudiante_de_proyecto(id_estudiante: int, id_proyecto: int, db: Session = Depends(get_db)):
    # Usamos SQLAlchemy Core para DELETE en tabla intermedia Muchos a Muchos
    statement = models.inscripciones.delete().where(
        (models.inscripciones.c.id_estudiante == id_estudiante) & 
        (models.inscripciones.c.id_proyecto == id_proyecto)
    )
    result = db.execute(statement)
    db.commit()
    
    # Validamos matemáticamente si se borró algo
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada.")
        
    return {"mensaje": "Inscripción eliminada."}
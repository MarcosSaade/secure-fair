from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de conexión (asegúrate de que los datos sean correctos)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:qweiopasdkln1001@localhost:5432/mi_base_backup_proyectos"

# El 'engine' es el punto de partida para cualquier aplicación SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Cada instancia de SessionLocal será una sesión de base de datos única
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para declarar los modelos ORM
Base = declarative_base()
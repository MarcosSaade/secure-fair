class Role:
    def __init__(self, name):
        self.name = name
        self.permissions = set()

    def add_permission(self, permission):
        self.permissions.add(permission)

    def remove_permission(self, permission):
        self.permissions.discard(permission)

    def __repr__(self):
        return f"Role(name={self.name}, permissions={self.permissions})"


class User:
    def __init__(self, username):
        self.username = username
        self.roles = set()

    def assign_role(self, role):
        self.roles.add(role)

    def remove_role(self, role):
        self.roles.discard(role)

    def has_permission(self, permission):
        return any(permission in role.permissions for role in self.roles)

    def __repr__(self):
        return f"User(username={self.username}, roles={self.roles})"


# Define roles
roles = {
    "estudiante": Role("Estudiante"),
    "socioformador": Role("Socioformador"),
    "administrador": Role("Administrador"),
    "scrum_master": Role("Scrum Master"),
    "backend_lead": Role("Backend Lead"),
    "security_engineer": Role("Security/Crypto + Auth Engineer"),
    "frontend_lead": Role("Frontend Lead"),
    "admin_data": Role("Admin Dashboard + Data/Exports Engineer"),
    "becario": Role("Becario"),
    "agente_proyecto": Role("Agente del Proyecto Solidario"),
}

# Define permissions
permissions = {
    "registrarse": "Registrarse en franjas horarias",
    "check_in": "Asistir y realizar check-in",
    "redimir_codigos": "Redimir códigos de inscripción",
    "crear_proyectos": "Crear y gestionar proyectos",
    "generar_codigos": "Generar códigos de inscripción para alumnos",
    "ver_metrica": "Acceder a métricas en tiempo real",
    "gestionar_datos": "Gestionar organizaciones y proyectos",
    "admin_logistica": "Gestionar la logística de la feria",
    "ver_reportes": "Visualizar reportes de asistencia",
    "importar_datos": "Realizar importaciones masivas de datos",
    "exportar_datos": "Generar reportes exportables",
}


# Assign permissions to roles
roles["estudiante"].add_permission(permissions["registrarse"])
roles["estudiante"].add_permission(permissions["check_in"])
roles["estudiante"].add_permission(permissions["redimir_codigos"])

roles["socioformador"].add_permission(permissions["crear_proyectos"])
roles["socioformador"].add_permission(permissions["generar_codigos"])

roles["administrador"].add_permission(permissions["gestionar_datos"])
roles["administrador"].add_permission(permissions["admin_logistica"])
roles["administrador"].add_permission(permissions["ver_metrica"])

roles["scrum_master"].add_permission(permissions["ver_reportes"])
roles["backend_lead"].add_permission(permissions["importar_datos"])
roles["backend_lead"].add_permission(permissions["exportar_datos"])
roles["security_engineer"].add_permission(permissions["ver_metrica"])

roles["frontend_lead"].add_permission(permissions["ver_reportes"])
roles["admin_data"].add_permission(permissions["importar_datos"])
roles["admin_data"].add_permission(permissions["exportar_datos"])

roles["becario"].add_permission(permissions["ver_reportes"])
roles["agente_proyecto"].add_permission(permissions["ver_reportes"])

# Example usage
user1 = User("Juan")
user1.assign_role(roles["estudiante"])

print(user1)
print("¿Juan tiene permiso para registrarse?", user1.has_permission(permissions["registrarse"]))
print("¿Juan tiene permiso para generar códigos?", user1.has_permission(permissions["generar_codigos"]))

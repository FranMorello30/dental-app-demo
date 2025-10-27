export interface Usuario {
    id: string;
    username: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    avatar: string;
    rol: string;
    ultimo_acceso: Date | null;
    fecha_creacion?: string;
    fecha_actualizacion?: Date | null;

    token: string;
}

export interface Disponibilidad {
    id: string;
    dia: string;
    hora_inicio: string;
    hora_fin: string;
}

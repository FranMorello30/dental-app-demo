export interface ResponseCliente {
  cliente: Cliente;
}

export interface Cliente {
  id: number;
  def_doc_fiscal: string;
  nro_id_fiscal: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email_principal: string;
  telefono_principal: string;
  email_secundario: string;
  telefono_secundario: string;
  estado_firmante: string;
  motivo_estado: null;
  comentarios: null;
  clasificacion: null;
  datos_adic: string;
  id_ejecutivo: number;
  fec_ult_gestion: Date;
  fec_prox_gestion: Date;
  createdAt: Date;
  updatedAt: Date;
  origen: string;
}

/* eslint-disable @typescript-eslint/naming-convention */
export interface TipoPrestacion {
    tipo_prestacion: string;
}

export type tipoGestion =
    | 'BITACORA'
    | 'SMS'
    | 'LLAMADA SALIENTE'
    | 'LLAMADA RECIBIDA'
    | 'EMAIL ENVIADO'
    | 'EMAIL RECIBIDO'
    | 'PAGOS'
    | 'WHATSAPP';

export type tipoDestino = 'cliente' | 'supervisor' | 'empresa';

export type destino = {
    empresa: {
        correos: string[];
    };
    cliente: {
        correos: string[];
    };
    supervisor: {
        correos: string[];
    };
};

/* eslint-disable @typescript-eslint/naming-convention */
export interface EnpointDefiniciones {
    definiciones: Definiciones;
}

export interface Definiciones {
    general: General;
    filtros: Filtros;
    gestion: Gestion;
}

export interface Filtros {
    proxGest: string[];
    clasifDeuda: string[];
    tipoDeuda: string[];
    diasAntig: DiasAntig[];
    clasesCob: string[];
    empresas: string[];
    filtroEspecial: string[];
}

export interface DiasAntig {
    label: string;
    value: string;
}

export interface General {
    preFactura: boolean;
    nomEmp: string;
    periodo: string;
    swicheCorreos: boolean;
    swicheSms: boolean;
    comprobantePago: boolean;
    nomSuper: string;
    nomCli: string;
    logo: string;
    limiteDeuda: number;
    linkPowerBi: string;
    columnasExpCierre: string[];
    columnasExpCxc: string[];
    columnasExpRut: string[];
    columnasExpCob: string[];
    columnasExpMantCli: string[];
    filtroCxc: boolean;
}

export interface Gestion {
    plantillaSms: boolean;
    opcionesPago: string[];
    correosSuper: string[];
    correosEmp: string[];
    estadosCli: string[];
    estadosCxc: string[];
    tablaCxc: TablasCxc;
    emailPersonalizado: boolean;
    opcionesOffMasivo: string[];
    opcionesCancelLlamada: string[];
    textosSugeridosEmail: { titulo: string; mensaje: string }[];
}

export interface TablasCxc {
    editarCxc: boolean;
    verGestionables: boolean;
    verPagadas: boolean;
    verAbonadas: boolean;
    verAnuladas: boolean;
    nomColumna: {
        label: string;
        value: string;
    };
}

export interface Estados {
    value: string;
    switch_gestionable: boolean;
    switch_habilitado: boolean;
    switch_masivo: boolean;
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatosCliente } from '../interfaces/datos-cliente.interface';

//const baseUrl = 'https://firmad.gcpron2.com';

@Injectable()
export class Helpers {
  constructor(private readonly configService: ConfigService) {}

  private readonly baseUrlHook = this.configService.get('BASEURLHOOK');
  private readonly baseUrlCall = this.configService.get('BASEURLCAll');

  private readonly _clientes = {
    felect_cl_oncovida_p: {
      rut: this.configService.get('RUT_ONCOVIDA'),
      usuario: this.configService.get('USU_CERT_ONCOVIDA'),
      password: this.configService.get('PASS_CERT_ONCOVIDA'),
      urlCall: this.baseUrlCall,
      urlHook: `${this.baseUrlHook}/proceso-firma/oncovida`,
      correo: this.configService.get('CORREO_PDF'),
    },
    demo: {
      rut: this.configService.get('RUT_GCPRON'),
      usuario: this.configService.get('USU_CERT_GCPRON'),
      password: this.configService.get('PASS_CERT_GCPRON'),
      urlCall: this.baseUrlCall,
      urlHook: `${this.baseUrlHook}/proceso-firma/demo`,
      correo: this.configService.get('CORREO_PDF'),
    },
  };

  retornarCliente(cliente: string): DatosCliente {
    return this._clientes[cliente];
  }

  actualizarPcteSalud(id: number, base64: number, motivo: string) {}
}

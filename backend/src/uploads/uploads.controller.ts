import { Response } from 'express';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { fileFilter, fileNamer } from './helpers/';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get('pdf/:archivo')
  findFilePdf(@Res() res: Response, @Param('archivo') imageName: string) {
    const path = this.uploadsService.getStaticPdf(imageName);
    res.sendFile(path);
  }

  @Get('/:archivo')
  findFile(@Res() res: Response, @Param('archivo') imageName: string) {
    const path = this.uploadsService.getStaticProductImages(imageName);
    res.sendFile(path);
  }

  @Delete('/:archivo')
  deleteFile(@Res() res: Response, @Param('archivo') imageName: string) {
    this.uploadsService.deleteFile(imageName);

    res.json({ msg: 'borrado' });
  }

  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      storage: diskStorage({
        destination: 'static',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure the file is an pdf.');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/uploads/${
      file.filename
    }`;
    return {
      nombre: file.filename,
      nombreOriginal: file.originalname,
      size: file.size,
      ruta: secureUrl,
    };
  }
}

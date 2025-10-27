import { existsSync, unlinkSync, unlink } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class UploadsService {
  getStaticProductImages(imageName: string) {
    //const path = join(__dirname, '../static/', imageName);
    const imagePath = path.resolve(process.cwd(), `static/${imageName}`);
    if (!existsSync(imagePath)) {
      throw new BadRequestException(` No product images found ${imageName}`);
    }
    return imagePath;
  }

  getStaticPdf(imageName: string) {
    //const path = join(__dirname, '../static/', imageName);
    const imagePath = path.resolve(process.cwd(), `static/report/${imageName}`);
    if (!existsSync(imagePath)) {
      throw new BadRequestException(` No product images found ${imageName}`);
    }
    return imagePath;
  }

  async deleteFile(file: string) {
    const path = join(__dirname, '../static/', file);

    if (!existsSync(path)) {
      throw new BadRequestException(` No found ${file}`);
    }

    unlink(`static/${file}`, (err) => {
      if (err) throw new BadRequestException(` No found 22 ${file}`);
      // if no error, file has been deleted successfully

      return true;
    });

    return true;
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {

  getStaticProductImage(imgName: string) {
    const path = join(__dirname, '../../static/products', imgName);
    if( !existsSync(path) ){
      throw new BadRequestException(`No product found with image ${ imgName }`);
    }

    return path;
  }

}

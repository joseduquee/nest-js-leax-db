import { Controller, Post, Get, UploadedFile, UseInterceptors, BadRequestException, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { fileNamer } from './helpers/fileNamer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
      private readonly filesService: FilesService,
      private readonly configService: ConfigService
    ) { }

  @Get('product/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string) {

    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile( path );
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {

    if(!file){
      throw new BadRequestException(`Make sure that file is an image`)
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${ file.filename }`

    return {
      secureUrl
    }
  }

  // @Post('product')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
  //       ],
  //     }),
  //   ) file: Express.Multer.File) {
  //   return file.originalname;
  // }

}

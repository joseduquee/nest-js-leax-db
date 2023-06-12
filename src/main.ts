import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )
  //Swagger========================================
  const config = new DocumentBuilder()
    .setTitle('Leax-Shop RESTful API')
    .setDescription('Leax-Shop endpoints')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  //================================================
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);

}
bootstrap();

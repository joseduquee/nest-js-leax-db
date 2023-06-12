import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([ Product, ProductImage ]),
    AuthModule
  ],
  exports: [
    ProductsService,
    //Con esto uso los repositorio de las dos entidades arriba creadas
    TypeOrmModule
  ]
})
export class ProductsModule {}

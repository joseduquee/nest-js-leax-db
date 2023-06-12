import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    //El patron repository viene ya configurado por defecto
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    
    try {
     
     const { images = [], ...productDetails} = createProductDto;
     
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ),
        user
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 1 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(({ images, ...rest}) => ({
      ...rest,
      images: images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`, {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImg')
      .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }
    return product;
  }

  //Este metodo es solo un intermedio que usa el findOne
  //para poder aplanar las images que vengan solo un arrar de string de urls
  async findOnePlain( term: string ) {
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    const { images, ...restToUpdate } = updateProductDto;
    
    
    //Esto lo prepara para la actualizacion
    const product = await this.productRepository.preload({
      id,
      ...restToUpdate
    });

    if (!product) throw new NotFoundException(`Product wit id: ${id} not found`);

    //Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      //Caso si tenemos imagenes
      if( images ) {
        //el segundo id el es productoId
        await queryRunner.manager.delete( ProductImage, { product: { id: id }})
        product.images = images.map(img => this.productImageRepository.create({ url: img }))
      } 

      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs!');
  }

  //Eliminar todos los productos
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}

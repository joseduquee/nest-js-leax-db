import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '073e45ec-1f2d-4cde-9fe7-6cf341dd8903',
        description: 'Product Id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Short Leax',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 'This is a description for this product',
        description: 'Product Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 12,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;
    @ApiProperty(
        {
            example: '0',
            description: 'Product price'
        }
    )
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty(
        {
            example: ['S', 'M', 'XL'],
            description: 'Product Sizez',
        }
    )
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: '073e45ec-1f2d-4cde-9fe7-6cf341dd8903',
        description: 't_short_leax',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];
    // type: ValidTypes;

    @ApiProperty({
        example: 'women',
        description: 'Product Gender',
    })
    @Column('text')
    gender: string;
    // gender: 'men' | 'women' | 'kid' | 'unisex'

    //Con el eager de TypeORM cada vez que utilizo un metodo find
    //para cargar el producto automaticamente va a cargar las imagenes
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }

        this.slug = this.slug
            .toLocaleLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLocaleLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '')
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOneBySlug(slug: string): Promise<Product> {
    return this.productModel.findOne({ slug }).exec();
  }

  async findAllFiltered(query: object): Promise<Product[]> {
    return this.productModel.find(query).exec();
  }

  async update(slug: string, data: Product): Promise<Product> {
    return this.productModel
      .findOneAndUpdate({ slug: slug }, data, { new: true })
      .exec();
  }
}

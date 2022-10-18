import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.schema';

@Controller('product')
export class ProductController {
  constructor(private productsService: ProductService) {}

  @Get()
  async index() {
    return await this.productsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param() params) {
    const product = await this.productsService.findOneBySlug(params.slug);
    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAllFiltered(@Body() query): Promise<Product[]> {
    return await this.productsService.findAllFiltered(query);
  }

  @Put(':slug')
  async update(
    @Param() params,
    @Body() product: CreateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(params.slug, product);
  }
}

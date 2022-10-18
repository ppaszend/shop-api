import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
  clearMongoCollections,
  getMongoConnection,
} from '../test-utils/mongo/MongooseTestModule';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { createProductDtoStub } from './test/stubs/product.dto.stub';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('ProductController', () => {
  let app: TestingModule;
  let productController: ProductController;
  let productModel: Model<Product>;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
      ],
      controllers: [ProductController],
      providers: [
        ProductService,
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    productModel = (await getMongoConnection()).model(
      Product.name,
      ProductSchema,
    );

    productController = app.get(ProductController);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  afterEach(async () => {
    await clearMongoCollections();
  });

  describe('createProduct', () => {
    it('should return the saved object', async () => {
      const createdProduct = await productController.create(
        createProductDtoStub(),
      );
      expect(createdProduct.name).toBe(createProductDtoStub().name);
    });
  });

  describe('getProductBySlug', () => {
    it('should return Product', async () => {
      await new productModel(createProductDtoStub()).save();
      const product = await productController.findBySlug({
        slug: createProductDtoStub().slug,
      });
      expect(product.name).toBe(createProductDtoStub().name);
    });

    it('should throw NotFoundException', async () => {
      try {
        await productController.findBySlug({
          slug: 'no-existent-product',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getProductByFilters', () => {
    it('Check products with price less than 25', async () => {
      await new productModel(createProductDtoStub(0, 19.99)).save();
      await new productModel(createProductDtoStub(1, 29.99)).save();
      await new productModel(createProductDtoStub(2, 39.99)).save();
      const products = await productController.findAllFiltered({
        price: {
          $lt: 25,
        },
      });

      expect(products.length).toBe(1);
      products.forEach((product) => {
        expect(product.price).toBeLessThan(25);
      });
    });

    it('Check products with price greater than 25', async () => {
      await new productModel(createProductDtoStub(0, 19.99)).save();
      await new productModel(createProductDtoStub(1, 29.99)).save();
      await new productModel(createProductDtoStub(2, 39.99)).save();
      const products = await productController.findAllFiltered({
        price: {
          $gt: 25,
        },
      });

      expect(products.length).toBe(2);
      products.forEach((product) => {
        expect(product.price).toBeGreaterThan(25);
      });
    });
  });
});

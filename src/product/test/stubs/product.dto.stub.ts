import { CreateProductDto } from '../../dto/create-product.dto';

export const createProductDtoStub = (
  id = 1,
  price = 19.99,
): CreateProductDto => ({
  name: `Example Product-${id}`,
  slug: `example-product-${id}`,
  price: price,
});

import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';

let mongod: MongoMemoryServer;
export let mongoConnection: Connection;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      mongoConnection = await getMongoConnection();
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};

export const clearMongoCollections = async () => {
  const collections = (await getMongoConnection()).collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export const getMongoConnection = async () => {
  return (await connect(mongod.getUri())).connection;
};

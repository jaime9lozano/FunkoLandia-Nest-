import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        autoLoadEntities: true,
        //entities: [`${__dirname}/**/*.entity{.ts,.js}`], // Cargamos todas las entidades
        // Entities no estan en config ahora, si no en /rest
        entities: [
          path.join(__dirname),
          '../../dist/rest/**/*.entity{.ts,.js}',
        ], // Cargamos todas las entidades,
        synchronize: process.env.NODE_ENV === 'dev', // Esto es para que se sincronicen las entidades con la base de datos
        //synchronize: true, // Esto es para que se sincronicen las entidades con la base de datos
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false, // Esto es para que se muestren los logs de las consultas
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log('Postgres database connected', 'DatabaseModule');
          return connection;
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

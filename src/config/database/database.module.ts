import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres', // Tipo de base de datos
        host: 'localhost', // Dirección del servidor
        port: 5432, // Puerto del servidor
        username: 'admin', // Nombre de usuario
        password: 'adminPassword123', // Contraseña de usuario
        database: 'tienda', // Nombre de la base de datos
        entities: [`${__dirname}/**/*.entity{.ts,.js}`], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
        synchronize: true, // Sincronizar la base de datos
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

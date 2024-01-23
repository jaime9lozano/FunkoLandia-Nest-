import { ApiProperty } from '@nestjs/swagger';

export class ResponseFunko {
  @ApiProperty({ example: 1, description: 'ID del funko' })
  id: number;
  @ApiProperty({ example: 'Spiderman', description: 'El nombre del funko' })
  nombre: string;
  @ApiProperty({ example: 15.99, description: 'El precio del funko' })
  precio: number;
  @ApiProperty({ example: 12, description: 'La cantidad del funko' })
  cantidad: number;
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del producto',
  })
  imagen: string;
  @ApiProperty({ example: 'Superheroe', description: 'Categoría del funko' })
  categoria: string;
  @ApiProperty({
    example: false,
    description: 'Indica si el funko ha sido eliminado',
  })
  is_deleted: boolean;
  @ApiProperty({
    example: '2023-09-01T12:34:56Z',
    description: 'Fecha y hora de creación del funko',
  })
  created_at: Date;
  @ApiProperty({
    example: '2023-09-02T10:20:30Z',
    description: 'Fecha y hora de actualización del funko',
  })
  updated_at: Date;
}

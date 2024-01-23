import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @ApiProperty({
    example: 'SpiderMan',
    description: 'El nombre del funko',
  })
  @IsOptional()
  nombre?: string;
  @ApiProperty({
    example: 16.99,
    description: 'El precio del funko',
  })
  @IsOptional()
  readonly precio?: number;
  @ApiProperty({
    example: 10,
    description: 'La cantidad del funko',
  })
  @IsOptional()
  readonly cantidad?: number;
  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'La URL de la imagen del funko',
  })
  @IsOptional()
  readonly imagen?: string;
  @ApiProperty({
    example: 'superheroe',
    description: 'La categoría del funko',
  })
  @IsOptional()
  @IsString()
  categoria?: string;
  @ApiProperty({
    example: true,
    description: 'Indica si el funko ha sido eliminado',
  })
  @IsOptional()
  @IsBoolean({ message: 'is_deleted tiene que ser un boolean' })
  readonly is_deleted: boolean = false;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
@Entity('funkos')
export class Funko {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150';
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;
  @Column({ type: 'varchar', length: 255 })
  nombre: string;
  @Column({ type: 'double precision', default: 0.0 })
  precio: number;
  @Column({ type: 'integer', default: 0 })
  cantidad: number;
  @Column({ type: 'text', default: Funko.IMAGE_DEFAULT })
  imagen: string;
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean = false;
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}

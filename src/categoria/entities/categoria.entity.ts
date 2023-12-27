import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Funko } from '../../funko/entities/funko.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  categoria: string;
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

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  is_deleted: boolean;

  @OneToMany(() => Funko, (producto) => producto.categoria)
  productos: Funko[];
}

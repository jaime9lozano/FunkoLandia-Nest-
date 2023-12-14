export class Funko {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: Categoria;
  is_deleted: boolean = false;
  fecha_cre: Date = new Date();
  fecha_act: Date = new Date();
}
export enum Categoria {
  DISNEY = 'disney',
  MARVEL = 'marvel',
  SUPERHEROES = 'superheroes',
  OTROS = 'otros',
}

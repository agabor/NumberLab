
import {TaskField} from './taskfield';
import {Field} from './field';

export class Sheet {
  fields: Field[][] = [];


  getField(field: TaskField): Field {
    if (this.fields) {
      const row = this.fields[field.row];
      if (row) {
        return row[field.column];
      }
    }
  }

}

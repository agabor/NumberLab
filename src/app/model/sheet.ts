import {Field} from './field';

export class Sheet {
  fields: Field[][] = [];


  getField(column: number, row: number): Field {
    if (this.fields) {
      const rowData = this.fields[row];
      if (rowData) {
        const field = rowData[column];
        if (field) {
          return field;
        }
      }
    }
    return new Field(column, row);
  }

}

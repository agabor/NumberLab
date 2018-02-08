import {Field} from './field';
import {Range} from './range';

export class Sheet {
  fields: Field[][] = [];


  getField(column: number, row: number): Field {
    if (this.fields) {
      const rowData = this.fields[row];
      if (rowData) {
        return rowData[column];
      }
    }
    return new Field(new Range(column, row));
  }

}

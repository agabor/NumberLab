import {TaskField} from './taskfield';
import {Field} from './field';
import {Range} from './range';

export class SortedNumberColumn extends TaskField {

  minRow: number = null;
  minRowValue: number = null;
  maxRow: number = null;
  maxRowValue: number = null;

  constructor(range: Range, public ascending: boolean) {
    super(range);
  }

  check(field: Field): boolean {
    const row = field.range.row0;
    const value = field.effectiveValue;
    if (this.minRow == null) {
      this.init(row, value);
      return true;
    }

    if (row < this.minRow) {
      if (this.ascending && value > this.minRowValue || !this.ascending && value < this.minRowValue) {
        this.hint = `A(z) ${field} és a ${new Range(this.range.column0, this.minRow)} cellák értéke nincs megfelelő sorrendben.`;
        this.init(null, null);
        return false;
      }
      this.minRow = row;
      this.minRowValue = value;
      return true;
    }

    if (row > this.maxRow) {
      if (this.ascending && value < this.maxRowValue || !this.ascending && value > this.maxRowValue) {
        this.hint = `A(z) ${field} és a ${new Range(this.range.column0, this.maxRow)} cellák értéke nincs megfelelő sorrendben.`;
        this.init(null, null);
        return false;
      }
      this.maxRow = row;
      this.maxRowValue = value;
      return true;
    }

    return false;
  }


  private init(row: number, value: number) {
    this.minRow = row;
    this.minRowValue = value;
    this.maxRow = row;
    this.maxRowValue = value;
  }
}

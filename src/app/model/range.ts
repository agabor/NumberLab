export class Range {
  constructor(public column0: number, public row0: number, public column1: number = null, public row1: number = null) {
    if (!column1) {
      column1 = column0;
    }
    if (!row1) {
      row1 = row0;
    }
  }


  public static stringCoords(column: number, row: number) {
    return String.fromCharCode('A'.charCodeAt(0) + column) + (row + 1);
  }

  public toString() {
    const fieldCoords = Range.stringCoords(this.column0, this.row0);
    if (this.column0 === this.column1 && this.row0 === this.row1) {
      return fieldCoords;
    }
    return fieldCoords + ':' + Range.stringCoords(this.column1, this.row1);
  }
}

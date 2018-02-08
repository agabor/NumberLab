export class Matrix {
  constructor(public data: (string|number)[][]) {

  }

  get(column: number, row: number): string|number {
    return this.data[row][column];
  }

  sub(column0: number, row0: number, column1: number, row1: number): Matrix {
    const data: (string|number)[][] = [];
    for (let r = row0; r <= row1; ++r) {
      const row: (string|number)[] = [];
      for (let c = column0; c <= column1; ++c) {
        row.push(this.data[r][c]);
      }
      data.push(row);
    }
    return new Matrix(data);
  }
}

import {Matrix} from './matrix';


describe('Matrix', () => {
  it('should split a matrix', () => {
    const m = new Matrix([
      [0, 1, 2, 3, 4, 5],
      [10, 11, 12, 13, 14, 15],
      [20, 21, 22, 23, 24, 25],
      [30, 31, 32, 33, 34, 35],
      [40, 41, 42, 43, 44, 45],
    ]);
    expect(m.sub(1, 1, 3, 3).data).toEqual(
      [
        [11, 12, 13],
        [21, 22, 23],
        [31, 32, 33]
      ]);
  });
});


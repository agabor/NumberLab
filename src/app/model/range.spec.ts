import {Range} from './range';


describe('Range', () => {
  it('should render range', () => {
    expect(new Range(1, 0, 2, 1).toString()).toBe('B1:C2');
  });
});


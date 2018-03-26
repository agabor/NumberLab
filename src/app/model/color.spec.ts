import {Color} from './color';


describe('Color', () => {
  it('should render color', () => {
    expect(new Color(0, 0, 0).html).toBe('#000000');
    expect(new Color(1, 1, 1).html).toBe('#ffffff');
    expect(new Color(0.5, 1, 0).html).toBe('#80ff00');
    expect(new Color(1, 1, 1).isSimilarTo(new Color(1, 1, 0.9))).toBe(true);
    expect(new Color(1, 1, 1).isSimilarTo(new Color(1, 1, 0))).toBe(false);
  });
});


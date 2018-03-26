import {Formula} from './formula';
import {Range} from './range';
import {Field} from './field';


describe('AppComponent', () => {

  it('should create the app', () => {
    const f = new Formula(['=SUM(', new Range(1, 0, 2, 0), ')']);
    expect(f.render(new Field(new Range(0, 0)))).toBe('=SUM(B1:C1)');
    expect(f.render(new Field(new Range(1, 0)))).toBe('=SUM(C1:D1)');
  });

});


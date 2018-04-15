import { DisplaySubTask } from './displaysubtask';
import { Range } from './range';
import { Display } from './display';
import { Color } from './color';
import { Field } from './field';

describe('DisplaySubtask', () => {
  it('', () => {
    const st = new DisplaySubTask(new Range(0, 0, 3, 3), getDisplay());
    const f = new Field(2, 2);
    f.display = getDisplay();
    expect(st.check(f)).toBe(true);
    f.display.underline = true;
    expect(st.check(f)).toBe(false);
  });
});
function getDisplay() {
  const display = new Display();
  display.backgroundColor = new Color(0, 0, 0);
  display.foregroundColor = new Color(1, 1, 1);
  display.bold = true;
  display.italic = true;
  display.strikethrough = false;
  display.underline = false;
  return display;
}


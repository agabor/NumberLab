
import {Sheet} from './sheet';
import {FormatTaskField, TaskField} from './taskfield';

export class Task {
  attempted = false;
  style: any = null;
  get errorMessage(): string {
    let result = '';
    for (const field of this.fields) {
      for (const hint of field.hints) {
        if (result.length > 0) {
          result += '\n';
        }
        result += hint;
      }
    }
    return result;
  }

  constructor(public description: string, public fields: TaskField[]) {
    for (const field of this.fields) {
      if (field instanceof FormatTaskField) {
        this.style = (<FormatTaskField>field).style;
        break;
      }
    }
  }

  check(sheet: Sheet): boolean {
    for (const field of this.fields) {
      if (!field.check(sheet.getField(field))) {
        return false;
      }
    }
    return true;
  }
}

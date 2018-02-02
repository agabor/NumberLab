
import {Sheet} from './sheet';
import {FormatTaskField, TaskField} from './taskfield';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

export class Task {
  attempted = false;
  description: SafeHtml = null;
  get errorMessage(): SafeHtml {
    let result = '';
    for (const field of this.fields) {
      for (const hint of field.hints) {
        if (result.length > 0) {
          result += '\n';
        }
        result += hint;
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  constructor(descriptionTemplate: string, public fields: TaskField[], private sanitizer: DomSanitizer = null) {
    const styles: string[] = [];
    for (const field of this.fields) {
      if (field instanceof FormatTaskField) {
        const formatTaskField = (<FormatTaskField>field);
        styles.push(formatTaskField.style);
      }
    }

    if (sanitizer) {
      for (const style of styles) {
        descriptionTemplate = descriptionTemplate.replace('[', '<span style="' + style + '">');
        descriptionTemplate = descriptionTemplate.replace(']', '</span>');
      }
      this.description = sanitizer.bypassSecurityTrustHtml(descriptionTemplate);
    } else {
      this.description = descriptionTemplate;
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

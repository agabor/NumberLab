
import {Sheet} from './sheet';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {DisplaySubTask} from './displaysubtask';
import {SubTask} from './subtask';

export class Task {
  attempted = false;
  description: SafeHtml = null;
  get errorMessage(): SafeHtml {
    let result = '';
    for (const field of this.fields) {
      if (field.hint) {
        if (result.length > 0) {
          result += '<br>';
        }
        result += field.hint;
      }
    }
    if (this.sanitizer) {
      return this.sanitizer.bypassSecurityTrustHtml(result);
    }
    return result;
  }

  constructor(descriptionTemplate: string, public fields: SubTask[], private sanitizer: DomSanitizer = null) {
    const styles: string[] = [];
    for (const field of this.fields) {
      if (field instanceof DisplaySubTask) {
        const formatTaskField = (<DisplaySubTask>field);
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
      for (let row = field.range.row0; row <= field.range.row1; ++row) {
        for (let column = field.range.column0; column <= field.range.column1; ++column) {
          const f = sheet.getField(column, row);
          if (!field.check(f)) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

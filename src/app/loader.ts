
import {Sheet} from './model/sheet';
import {Color} from './model/color';
import {Format} from './model/format';
import {Field} from './model/field';

export class SheetLoader {
  gapi: any = null;
  onLoaded: (sheet: Sheet) => void;

  private static parseFormula(cell): string {
    const userEnteredValue = cell.userEnteredValue;
    if (userEnteredValue) {
      return userEnteredValue.stringValue
        || cell.userEnteredValue.formulaValue
        || String(userEnteredValue.numberValue)
        || '';
    }
    return '';
  }


  private static parseFormat(effectiveFormat: any) {
    const format = new Format;
    if (effectiveFormat) {
      const bgcolor = effectiveFormat.backgroundColor;
      format.backgroundColor = new Color(bgcolor.red || 0, bgcolor.green || 0, bgcolor.blue || 0);
      const fgcolor = effectiveFormat.textFormat.foregroundColor;
      format.foregroundColor = new Color(fgcolor.red || 0, fgcolor.green || 0, fgcolor.blue || 0);
      format.bold = effectiveFormat.textFormat.bold;
      format.italic = effectiveFormat.textFormat.italic;
      format.underline = effectiveFormat.textFormat.underline;
      format.strikethrough = effectiveFormat.textFormat.strikethrough;
    }
    return format;
  }
  load(spreadsheetId: string) {
    const sheet = new Sheet();
    const self = this;

    this.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      ranges: ['Sheet1!A1:E10'],
      includeGridData: true
    }).then(function (response) {
      for (const data of response.result.sheets[0].data[0].rowData) {
        const row: Field[] = [];
        if (data.values) {
          for (const cell of data.values) {
            const field = new Field();
            field.value = cell.formattedValue || '';
            field.formula = SheetLoader.parseFormula(cell);
            field.format = SheetLoader.parseFormat(cell.effectiveFormat);
            row.push(field);
          }
        }
        sheet.fields.push(row);
      }
      self.onLoaded(sheet);
    }, function (response) {
      console.log(response.result.error.message);
    });
  }

}

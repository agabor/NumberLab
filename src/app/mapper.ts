
import {Sheet} from './model/sheet';
import {Color} from './model/color';
import {Display} from './model/display';
import {Field} from './model/field';
import {Section} from './model/section';
import {isNumber} from 'util';

export class Mapper {
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
    const format = new Display;
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
    gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: true
    }).then(r => this.parse(r), function (response) {
      console.log(response.result.error.message);
    });
  }

  parse(response) {
    const sheet = new Sheet();
    console.log(response);
    for (const data of response.result.sheets[0].data[0].rowData) {
      const row: Field[] = [];
      if (data.values) {
        for (const cell of data.values) {
          const field = new Field(row.length, sheet.fields.length);
          field.formattedValue = cell.formattedValue || '';
          field.formula = Mapper.parseFormula(cell);
          field.display = Mapper.parseFormat(cell.effectiveFormat);
          if (cell.effectiveValue) {
            field.effectiveValue = cell.effectiveValue.numberValue || cell.effectiveValue.stringValue;
          }
          const userEnteredFormat = cell.userEnteredFormat;
          if (userEnteredFormat) {
            const numberFormat = userEnteredFormat.numberFormat;
            if (numberFormat) {
              field.format = numberFormat.pattern;
            }
          }
          row.push(field);
        }
      }
      sheet.fields.push(row);
    }
    this.onLoaded(sheet);
  }


  public create(gapi: any, section: Section, callback: (id: string) => void) {
    const self = this;
    let spreadsheetId = '';
    gapi.client.sheets.spreadsheets.create({
      'properties': {'title': section.title}
    }).then(function (response) {
      spreadsheetId = response.result.spreadsheetId;
      self.initData(spreadsheetId, section, gapi, callback);
    });
  }

  private initData(spreadsheetId: string, section: Section, gapi: any, callback: (id: string) => void) {
    gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requests: [{
        'updateCells': {
          'start': {
            'sheetId': 0,
            'rowIndex': 0,
            'columnIndex': 0
          },
          'rows': this.getData(section),
          'fields': 'userEnteredValue,userEnteredFormat.backgroundColor'
        }
      }],
    }).then(function (r) {
        console.log(r);
        callback(spreadsheetId);
      }
    );
  }

  private getData(section: Section): object[] {
    const data = [];
    for (const row of section.values.data) {
      const rowData = {'values': []};
      for (const value of row) {
        if (isNumber(value)) {
          rowData.values.push({'userEnteredValue': {'numberValue': value}});
        } else {
          rowData.values.push({'userEnteredValue': {'stringValue': value}});
        }
      }
      data.push(rowData);
    }
    return data;
  }
}

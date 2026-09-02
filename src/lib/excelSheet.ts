import "server-only";
import ExcelJS from "exceljs";

// Paleta de DISENIO.md / tokens.css, en hex: exceljs no lee custom properties CSS.
export const EXCEL_BRAND = { petroleo: "3F738D", ink: "0D1E29", border: "E2DDD6", sunken: "F0EDE8", muted: "6B7280" };

export type ExcelColumn<T> = {
  header: string;
  width: number;
  value: (row: T) => string | number | Date;
  numFmt?: string;
  // Para columnas tipo "estado": si vuelve un color, la celda se pinta con
  // ese tono y en negrita en vez del gris de texto normal.
  fontColor?: (row: T) => string | undefined;
};

/* Un solo lugar para el "excelente diseño" pedido en el export de
   candidatos: título + subtítulo institucionales, encabezado con el color de
   marca, cebra suave, encabezado congelado y autofiltro. Lo comparten el
   export por vacante (vacancyReport) y el export general de applications —
   antes de esto cada route handler tenía su propia copia del mismo código. */
export async function buildStyledWorkbook<T>(options: {
  sheetName: string;
  title: string;
  subtitle: string;
  columns: ExcelColumn<T>[];
  rows: T[];
}): Promise<ExcelJS.Buffer> {
  const { sheetName, title, subtitle, columns, rows } = options;
  const HEADER_ROW = 4;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Center Quest";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: HEADER_ROW }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: `FF${EXCEL_BRAND.ink}` } };
  sheet.getRow(1).height = 26;

  sheet.mergeCells(2, 1, 2, columns.length);
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = subtitle;
  subtitleCell.font = { name: "Calibri", size: 10.5, color: { argb: `FF${EXCEL_BRAND.muted}` } };
  sheet.getRow(2).height = 18;

  const headerRow = sheet.getRow(HEADER_ROW);
  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${EXCEL_BRAND.petroleo}` } };
    cell.alignment = { vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: `FF${EXCEL_BRAND.petroleo}` } } };
  });
  headerRow.height = 20;

  rows.forEach((row, index) => {
    const sheetRow = sheet.getRow(HEADER_ROW + 1 + index);
    const zebra = index % 2 === 1;
    columns.forEach((column, colIndex) => {
      const cell = sheetRow.getCell(colIndex + 1);
      cell.value = column.value(row);
      if (column.numFmt) cell.numFmt = column.numFmt;

      const fontColor = column.fontColor?.(row);
      cell.font = { name: "Calibri", size: 10.5, bold: Boolean(fontColor), color: { argb: `FF${fontColor ?? EXCEL_BRAND.ink}` } };
      cell.alignment = { vertical: "middle" };
      cell.border = { bottom: { style: "hair", color: { argb: `FF${EXCEL_BRAND.border}` } } };
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${EXCEL_BRAND.sunken}` } };
    });
  });

  if (rows.length > 0) {
    sheet.autoFilter = { from: { row: HEADER_ROW, column: 1 }, to: { row: HEADER_ROW + rows.length, column: columns.length } };
  }

  return workbook.xlsx.writeBuffer();
}

export function excelFilename(title: string, suffix: string): string {
  const ascii = title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "export";
  return `${ascii}-${suffix}.xlsx`;
}

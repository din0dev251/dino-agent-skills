import { google } from "googleapis";
import type { JWT } from "google-auth-library";

const getAuth = (): JWT => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error("Thiếu GOOGLE_SERVICE_ACCOUNT_EMAIL hoặc GOOGLE_PRIVATE_KEY");
  }
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

export async function getSheetsClient() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error("Thiếu GOOGLE_SHEETS_ID");
  return { sheets, sheetId };
}

type Row = (string | number)[];

export async function getSheetValues(sheetName: string): Promise<Row[]> {
  const { sheets, sheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:Z`,
  });
  const rows = (res.data.values || []) as Row[];
  return rows;
}

export async function appendRow(sheetName: string, row: Row): Promise<void> {
  const { sheets, sheetId } = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function updateRow(
  sheetName: string,
  rowIndex: number,
  row: Row
): Promise<void> {
  const { sheets, sheetId } = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function deleteRow(
  sheetName: string,
  rowIndex: number
): Promise<void> {
  const { sheets, sheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });
  const sheet = res.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (sheet?.properties?.sheetId === undefined) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

export function rowsToObjects<T>(rows: Row[], keys: (keyof T)[]): T[] {
  if (rows.length < 2) return [];
  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const obj: Record<string, unknown> = {};
    keys.forEach((key, i) => {
      let val = row[i];
      if (val === "" || val === undefined) val = null;
      obj[key as string] = val;
    });
    return obj as T;
  });
}

export function objectToRow(obj: Record<string, unknown>, keys: string[]): Row {
  return keys.map((k) => {
    const v = obj[k];
    if (Array.isArray(v)) return JSON.stringify(v);
    return v ?? "";
  });
}

/** Trả về số dòng trong sheet (1-based). Row 1 = header, row 2 = data đầu tiên. */
export async function getSheetRowIndex(
  sheetName: string,
  idColumn: string,
  idValue: string
): Promise<number | null> {
  const rows = await getSheetValues(sheetName);
  if (rows.length < 2) return null;
  const header = rows[0] as string[];
  const colIndex = header.findIndex(
    (h) => h?.toLowerCase() === idColumn.toLowerCase()
  );
  if (colIndex < 0) return null;
  const dataRowIndex = (rows as Row[]).slice(1).findIndex((r) => String(r[colIndex]) === idValue);
  if (dataRowIndex < 0) return null;
  return dataRowIndex + 2; // sheet row: +1 vì slice(1), +1 vì header
}

import ExcelJS, { Workbook, Worksheet } from "exceljs"
import { saveAs } from 'file-saver';
import { ArtColumn } from "ali-react-table"

export interface ExportExcelProps {
  columns?: ArtColumn[];
  dataSource?: any[];
  fileName?: string
  fileExt?: string
}

const getHeaderLevel = (columns: ArtColumn[]) => {
  let headerLevel = 0
  const loop = (columns: ArtColumn[], level: number = 1) => {
    if (Array.isArray(columns) && columns.length) {
      if (level > headerLevel) {
        headerLevel = level
      }
      columns.forEach((column) => {
        if (column.children) {
          loop(column.children, level++);
        }
      })
    }
  }
  loop(columns)
  return headerLevel
}

const createHeader = (worksheet: Worksheet, columns: ArtColumn[]) => {
  const lastColumn: ArtColumn[] = []
  const headerLevel = getHeaderLevel(columns)
  const loop = (columns: ArtColumn[], preCol: number = 0, level: number = 0) => {
    let childNum = preCol
    if (Array.isArray(columns) && columns.length) {
      const row = worksheet.getRow(level + 1)
      // 获取行
      columns.forEach((column, index) => {
        // 获取单元格
        const cell = row.getCell(index + preCol + 1)
        cell.value = column.name;

        if (column.children) {
          const num = loop(column.children, childNum, level++);
          worksheet.mergeCells(level, index + preCol + 1, 0, preCol + num);
          childNum += num
        } else {
          //最后渲染列表
          lastColumn.push(column)
          // 合并行个数
          const mergeRowNum = headerLevel - level
          if (mergeRowNum > 1) {
            // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
            // top left bottom right
            worksheet.mergeCells(level, index + preCol + 1, mergeRowNum, 0);
          }
          childNum++;
        }
      })
    }
    return childNum
  }
  loop(columns)

  return { headerLevel }
}


export const exportExcel = (options: ExportExcelProps) => {
  try {


    const { columns = [], dataSource = [], fileName = 'data', fileExt = 'xlsx', } = options
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('main');
    const { headerLevel } = createHeader(worksheet, columns)
    // headerLevel
    const lg = dataSource.length
    const columnsLg = columns.length;
    for (let index = 0; index < lg; index++) {
      const itemData = dataSource[index];
      // 行
      const row = worksheet.getRow(index + headerLevel + 1)
      for (let k = 0; k < columnsLg; k++) {
        // 单元格
        const cell = row.getCell(k + 1)
        const column = columns[k];
        cell.value = itemData[column.code]
      }
    }

    // worksheet.autoFilter = {
    //   from: 'A3',
    //   to: 'C3',
    // }

    // const columns = [
    //   { header: 'Id', key: 'id', width: 10 },
    //   { header: 'Name', key: 'name', width: 32 },
    //   { header: 'DOB', key: 'dob', width: 10 }
    // ]
    // worksheet.columns = columns;
    // const rows = []
    // Array.from({ length: 20 }).forEach((_, index) => {
    //   let row = []
    //   columns.forEach((item) => {
    //     row.push(`${item.key}-${index}`)
    //   })
    //   rows.push(row)
    // })
    // worksheet.autoFilter = {
    //   from: 'A3',
    //   to: 'C3',
    // }

    // // 链接到网络
    // worksheet.getCell('A1').value = {
    //   text: 'www.mylink.com',
    //   hyperlink: 'http://www.mylink.com',
    //   tooltip: 'www.mylink.com'
    // };

    // // 内部链接
    // worksheet.getCell('A1').value = { text: 'Sheet2', hyperlink: '#\'Sheet2\'!A1' };

    // 合并一系列单元格
    // worksheet.mergeCells('A4:B5');
    // 按左上，右下合并
    // worksheet.mergeCells('K10', 'M12');
    // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
    // worksheet.mergeCells(10, 11, 12, 13);

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${fileName}.${fileExt}`);
    });
  } catch (error) {
    console.error(error)
  }
}
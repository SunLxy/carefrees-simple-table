import ExcelJS, { Workbook, Worksheet } from "exceljs"
import { saveAs } from 'file-saver';
import { ArtColumn } from "ali-react-table"

interface ArtColumnMerge extends ArtColumn {
  /**合并列数*/
  __mergeLeng?: number
  /**当前列下标*/
  __colIndex?: number
  /**层级*/
  __level?: number
}

export interface ExportExcelProps {
  columns?: ArtColumnMerge[];
  dataSource?: any[];
  fileName?: string
  fileExt?: string
}

const getHeaderLevel = (columns: ArtColumnMerge[]) => {
  let headerLevel = 0
  let isFilter = false
  const loop = (columns: ArtColumnMerge[], preColIndex: number = 0, level: number = 1) => {
    let list = [...columns]
    let mergeLeng = 0;
    let colIndex = preColIndex;
    if (Array.isArray(columns) && columns.length) {
      if (level > headerLevel) {
        headerLevel = level
      }
      list = columns.map((column) => {
        const newColumn = { ...column }
        if (column?.features?.filter) {
          isFilter = true
        }
        newColumn.__colIndex = colIndex + 1
        newColumn.__level = level
        newColumn.__mergeLeng = 0

        if (column.children) {
          const data = loop(column.children, colIndex, level + 1);
          newColumn.children = data.list;
          newColumn.__mergeLeng = data.mergeLeng
          mergeLeng = mergeLeng + data.mergeLeng;
          colIndex = data.colIndex
        } else {
          mergeLeng = mergeLeng + 1
          colIndex = colIndex + 1
        }
        return newColumn;
      })
    }
    return { list, mergeLeng, colIndex }
  }
  const newColumns = loop(columns)

  return { headerLevel, isFilter, columns: newColumns.list }
}

/**创建表头*/
const createHeader = (worksheet: Worksheet, oldColumns: ArtColumn[]) => {
  const lastColumns: ArtColumn[] = []
  const { headerLevel, isFilter, columns } = getHeaderLevel(oldColumns)
  const loop = (columns: ArtColumnMerge[], level: number = 0) => {
    if (Array.isArray(columns) && columns.length) {
      const row = worksheet.getRow(level + 1)
      // 获取行
      columns.forEach((column) => {
        // 获取单元格
        const cell = row.getCell(column.__colIndex)
        cell.value = column.name;
        if (column.children) {
          loop(column.children, level + 1);
          if (column.__mergeLeng) {
            const top = level + 1;
            const left = column.__colIndex;
            const bottom = level + 1;
            const right = column.__colIndex + column.__mergeLeng - 1;
            try {
              worksheet.mergeCells(top, left, bottom, right)
            } catch (error) {
              console.log(error)
            }
          }
        } else {
          //最后渲染列表
          lastColumns.push(column)
          // 合并行个数
          const mergeRowNum = headerLevel - level
          if (mergeRowNum > 1) {
            const top = level + 1;
            const left = column.__colIndex;
            const bottom = headerLevel;
            const right = column.__colIndex;
            // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
            try {
              worksheet.mergeCells(top, left, bottom, right)
            } catch (error) {
              console.log(error)
            }
          }
        }
      })
    }
  }
  loop(columns)
  return { headerLevel, isFilter, lastColumns }
}

/**导出数据*/
export const exportExcel = (options: ExportExcelProps) => {
  try {
    const { columns = [], dataSource = [], fileName = 'data', fileExt = 'xlsx', } = options
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('main');
    const { headerLevel, isFilter, lastColumns } = createHeader(worksheet, columns)
    const lg = dataSource.length
    const lastColumnsLg = lastColumns.length;
    for (let index = 0; index < lg; index++) {
      const itemData = dataSource[index];
      // 行
      const row = worksheet.getRow(index + headerLevel + 1)
      for (let k = 0; k < lastColumnsLg; k++) {
        // 单元格
        const cell = row.getCell(k + 1)
        const column = lastColumns[k];
        cell.value = itemData[column.code]
      }
    }
    if (isFilter) {
      worksheet.autoFilter = {
        from: { row: headerLevel, column: 1 },
        to: { row: headerLevel, column: lastColumnsLg }
      }
    }
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${fileName}.${fileExt}`);
    });
  } catch (error) {
    console.error(error)
  }
}
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


interface DataSource {
  /**子集个数*/
  __childLeng?: number
  /**当前数据行*/
  __rowIndex?: number
  /**层级*/
  __level?: number
  /**子集*/
  children?: DataSource[]
  [x: string]: any
}


export interface ExportExcelProps {
  columns?: ArtColumnMerge[];
  dataSource?: any[];
  fileName?: string
  fileExt?: string
  /**分组列数据*/
  groupColumns?: ArtColumnMerge[]
}

const handleColumns = (columns: ArtColumnMerge[]) => {
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

// const handleDataSource = (dataSource: DataSource[]) => {
//   let preRowIndex = 0
//   const loop = (dataSource: DataSource[], level: number = 1) => {
//     let list = [...dataSource]
//     let childLeng = 0;
//     if (Array.isArray(dataSource) && dataSource.length) {
//       list = dataSource.map((itemData) => {
//         const newItemData = { ...itemData }
//         preRowIndex++
//         childLeng++;
//         newItemData.__rowIndex = preRowIndex;
//         newItemData.__level = level
//         newItemData.__childLeng = 0;
//         if (Array.isArray(itemData.children)) {
//           const data = loop(itemData.children, level + 1);
//           newItemData.children = data.list;
//           newItemData.__childLeng = data.childLeng
//         }
//         return newItemData;
//       })
//     }
//     return { list, childLeng, }
//   }
//   return loop(dataSource)
// }

/**创建表头*/
const createHeader = (worksheet: Worksheet, oldColumns: ArtColumn[]) => {
  const lastColumns: ArtColumn[] = []
  const { headerLevel, isFilter, columns } = handleColumns(oldColumns)
  const loop = (columns: ArtColumnMerge[], level: number = 0) => {
    if (Array.isArray(columns) && columns.length) {
      const row = worksheet.getRow(level + 1)
      // 获取行
      columns.forEach((column) => {
        // 获取单元格
        const cell = row.getCell(column.__colIndex)
        cell.value = column.name;
        cell.font = { ...cell.font, bold: true }
        if (column.children) {
          loop(column.children, level + 1);
          if (column.__mergeLeng) {
            cell.style.alignment = { horizontal: "center" }
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

interface DefaultCreateCellOptions {
  worksheet: Worksheet,
  dataSource: any[],
  lastColumns: ArtColumnMerge[],
  headerLevel: number
}

// /**默认生成数据*/
// const defaultCreateCell = (options: DefaultCreateCellOptions) => {
//   const { worksheet, dataSource, lastColumns, headerLevel } = options
//   const lg = dataSource.length
//   const lastColumnsLg = lastColumns.length;
//   /**记录已经合并的单元格*/
//   const mergeCellData = new Set([])
//   for (let rowIndex = 0; rowIndex < lg; rowIndex++) {
//     const itemData = dataSource[rowIndex];
//     // 行
//     const row = worksheet.getRow(rowIndex + headerLevel + 1)
//     for (let k = 0; k < lastColumnsLg; k++) {
//       // 单元格
//       const cell = row.getCell(k + 1)
//       const column = lastColumns[k];
//       cell.value = itemData[column.code]
//       cell.style.alignment = { vertical: "middle", horizontal: "center" }
//       if (typeof column.getSpanRect === "function") {
//         const spanRect = column.getSpanRect(itemData[column.code], itemData, rowIndex);
//         try {
//           let top = spanRect.top + headerLevel + 1 // 获取合并开始行
//           let left = spanRect.left + 1; // 开始合并列
//           let bottom = headerLevel + spanRect.bottom // 结束合并行
//           let right = spanRect.right; // 结束合并列
//           // 这个不能使用 0 开始
//           const key = `${top}_${left}_${bottom}_${right}`
//           if (!mergeCellData.has(key)) {
//             mergeCellData.add(key)
//             worksheet.mergeCells(top, left, bottom, right);
//           }
//         } catch (error) {
//           console.log('defaultCreateCell===mergeCells==>', error)
//         }
//       }
//     }
//   }
// }

interface GroupCreateCellOptions extends DefaultCreateCellOptions {
  /**分组列数据*/
  groupColumns: ArtColumnMerge[]
}

/**分组数据生成*/
const createExcelCell = (options: GroupCreateCellOptions) => {
  const { worksheet, dataSource, lastColumns, headerLevel, groupColumns } = options
  const lastColumnsLg = lastColumns.length;
  /**默认前面多少行*/
  let preRowIndex = headerLevel
  /**记录已经合并的单元格*/
  const mergeCellData = new Set([])
  const loop = (dataList: DataSource[], level: number = 0) => {
    /**统计当前循环和子集总共多少个*/
    let childLeng = 0;
    if (Array.isArray(dataList) && dataList.length) {
      const lg = dataList.length
      const groupColumn = groupColumns?.[level]
      for (let rowIndex = 0; rowIndex < lg; rowIndex++) {
        preRowIndex++
        childLeng++;
        const itemData = dataList[rowIndex]
        /**获取行*/
        const rowCell = worksheet.getRow(preRowIndex)
        if (groupColumn && Array.isArray(itemData.children)) {
          /**获取单元格*/
          const cell = rowCell.getCell(1)
          cell.value = `${groupColumn.name}:${itemData[groupColumn.code]}`
          cell.font = { ...cell.font, bold: true }
          cell.style.alignment = { vertical: "middle", horizontal: "left" }
          try {
            /**合并子集数据*/
            worksheet.mergeCells(preRowIndex, 0, preRowIndex, lastColumnsLg);
          } catch (error) {
            console.log('groupCreateCell===mergeCells==>', error)
          }
          /**循环子集*/
          const leng = loop(itemData.children, level + 1);
          rowCell.outlineLevel = leng;
        } else {
          for (let k = 0; k < lastColumnsLg; k++) {
            // 单元格
            const cell = rowCell.getCell(k + 1)
            const column = lastColumns[k];
            cell.value = itemData[column.code]
            cell.style.alignment = { vertical: "middle", horizontal: "center" }
            // 行列合并
            if (typeof column.getSpanRect === "function") {
              const spanRect = column.getSpanRect(itemData[column.code], itemData, rowIndex);
              try {
                let top = spanRect.top + headerLevel + 1 // 获取合并开始行
                let left = spanRect.left + 1; // 开始合并列
                let bottom = headerLevel + spanRect.bottom // 结束合并行
                let right = spanRect.right; // 结束合并列
                // 这个不能使用 0 开始
                const key = `${top}_${left}_${bottom}_${right}`
                if (!mergeCellData.has(key)) {
                  mergeCellData.add(key)
                  worksheet.mergeCells(top, left, bottom, right);
                }
              } catch (error) {
                console.log('defaultCreateCell===mergeCells==>', error)
              }
            }
          }
        }
      }
    }
    return childLeng
  }
  loop(dataSource)
}

/**导出数据*/
export const exportExcel = (options: ExportExcelProps) => {
  try {
    const { columns = [], dataSource = [], fileName = 'data', fileExt = 'xlsx', groupColumns } = options
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('main');
    // headerLevel 头部行数 
    // isFilter 是否存在过滤
    // lastColumns 渲染列
    const { headerLevel, isFilter, lastColumns } = createHeader(worksheet, columns)
    const lastColumnsLg = lastColumns.length;
    createExcelCell({ worksheet, dataSource, lastColumns, headerLevel, groupColumns })
    // 设置视图属性
    worksheet.views = [{ state: 'frozen', ySplit: headerLevel }];
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
    console.error('exportExcel===>', error)
  }
}
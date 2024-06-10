
/**
 * 1. 拖拽的分组列放入顶部，并且可以进行排序
 * 2. 分组的数据唯一值进行自动生成
 * 3. 分组的数据占据一整行
*/

import { TablePipeline, ArtColumn } from "ali-react-table"
import { layeredGroup } from "../../utils"
import { Fragment } from "react"

export interface GroupFeatureOptions {
  /** 更新过滤字段列表的回调函数 */
  onChangeGroup?(colums: ArtColumn[], colum: ArtColumn): void
  /**分组配置*/
  groupItems?: ArtColumn[]
  /** icon 的缩进值。一般为负数，此时 icon 将向左偏移，默认从 pipeline.ctx.indents 中获取 */
  iconIndent?: number

  /** icon 与右侧文本的距离，默认从 pipeline.ctx.indents 中获取 */
  iconGap?: number

  /** 每一级缩进产生的距离，默认从 pipeline.ctx.indents 中获取 */
  indentSize?: number
}

export function CustomGroup(options: GroupFeatureOptions = {}) {
  return (pipeline: TablePipeline) => {
    const ctx = pipeline.ctx
    // indents
    const iconWidth = ctx.indents.iconWidth
    const iconIndent = options.iconIndent ?? ctx.indents.iconIndent
    const iconGap = options.iconGap ?? ctx.indents.iconGap
    const indentSize = options.indentSize ?? ctx.indents.indentSize

    const primaryKey = pipeline.ensurePrimaryKey('custom-group')
    /**获取分组数据*/
    const customGroupColumns: ArtColumn[] = pipeline.getStateAtKey("custom-group") || options?.groupItems || []
    const dataSource = pipeline.getDataSource() // 获取数据
    const columns = pipeline.getColumns() //获取列
    pipeline.columns(processColumns(columns)) // 处理表头渲染过滤渲染
    pipeline.dataSource(processDataSource(dataSource)) // 处理渲染数据

    //   const onChangeValues = (code: string, values: ValueType[]) => {
    //     const list = (pipeline.getStateAtKey("filter") || []).filter((ite: FilterItem) => ite.code !== code);
    //     const newList = [...list].concat({ code, value: values })
    //     options?.onChangeFilter?.(newList, code)
    //     pipeline.setStateAtKey('filter', newList)
    //   }

    return pipeline

    /**列表数据处理*/
    function processDataSource(dataSource: any[]) {
      // 数据进行分组
      const dataList = layeredGroup(dataSource, customGroupColumns, primaryKey)
      // console.log('dataList', dataList)
      return dataList
    }
    /**列处理*/
    function processColumns(columns: ArtColumn[]) {
      // 列进行添加或者过滤
      /**
       * 1. 先过滤数据
       * 2. 在首列添加列宽为0的分组列，为了展示分组的数据
      */
      const newColums = columns.filter((it) => !customGroupColumns.find((item) => item.code === it.code));
      const length = columns.length;
      const indent = iconIndent + (customGroupColumns.length * indentSize);
      const customGroupItem: ArtColumn = {
        name: "",
        code: "__custom_group__",
        width: indent + iconWidth + iconGap,
        getSpanRect: (value, row, rowIndex) => {
          if (row.___isGroup) {
            return { top: rowIndex, left: 0, bottom: rowIndex + 1, right: length }
          }
          return { top: rowIndex, left: 0, bottom: rowIndex + 1, right: 1 }
        },
        render: (value, row, rowIndex) => {
          if (row.___isGroup) {
            const ___level = row.___level;
            const item = customGroupColumns[___level];
            if (item.render)
              return item.render(value, row, rowIndex)
            return value
          }
          return value
        }
      }
      return [customGroupItem].concat(newColums)
    }
  }

}
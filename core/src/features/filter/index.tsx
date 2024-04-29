
import { TablePipeline, ArtColumn, isLeafNode, collectNodes, internals } from "ali-react-table"
import { layeredFilter } from "../../utils"
import { FilterItem } from "../../interface"
import styled from "styled-components"
import { HTMLAttributes } from "react"

const TableHeaderCell = styled.div`
  display: flex;
  align-items: center;
`

function FilterIcon(props: HTMLAttributes<HTMLOrSVGElement>) {
  return <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="filter"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M349 838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V642H349v196zm531.1-684H143.9c-24.5 0-39.8 26.7-27.5 48l221.3 376h348.8l221.3-376c12.1-21.3-3.2-48-27.7-48z" />
  </svg>
}


export interface FilterHeaderCellProps {

  /** 在添加排序相关的内容之前 表头原有的渲染内容 */
  children?: React.ReactNode
  /** 当前列的配置 */
  column?: ArtColumn
  /** 选中的回调 */
  onClick?(item: any): void
  /**列表数据*/
  items?: string[]
  /**选中数据*/
  value?: string[]
}

function DefaultFilterHeaderCell(props: FilterHeaderCellProps) {
  const { children, value, items = [] } = props

  const set = new Set(value)
  const isAllChecked = items.length > 0 && items.every((key) => set.has(key))
  const isAnyChecked = items.some((key) => set.has(key))

  /**
   * 点击图标
  */
  const onClickIcon = (event: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
    event?.stopPropagation?.()
    event?.preventDefault?.()


  }

  return <TableHeaderCell>
    {children}
    <FilterIcon onClick={onClickIcon} />
  </TableHeaderCell>
}



export interface FilterFeatureOptions {
  /** 更新过滤字段列表的回调函数 */
  onChangeFilter?(nextFilter: FilterItem[]): void
}

export function filter(options: FilterFeatureOptions) {

  return (pipeline: TablePipeline) => {

    /**获取过滤参数  */
    const inputFilter: FilterItem[] = pipeline.getStateAtKey("filter") || []

    const dataSource = pipeline.getDataSource() // 获取数据
    const columns = pipeline.getColumns() //获取列
    pipeline.columns(processColumns(columns)) // 处理表头渲染过滤渲染
    pipeline.dataSource(processDataSource(dataSource)) // 处理渲染数据

    return pipeline

    // 列表数据处理
    function processDataSource(dataSource: any[]) {

      const filterColumnsMap = new Map(
        collectNodes(columns, 'leaf-only')
          .filter((col) => !!col.features?.filter)
          .map((col) => [col.code, col]),
      )

      return layeredFilter(dataSource, (item) => {
        let newItem = { ...item }
        for (let index = 0; index < inputFilter.length; index++) {
          const element = inputFilter[index];
          const column = filterColumnsMap.get(element.code)
          const filter = column?.features?.filter?.onFilter || column?.features?.filter
          if (typeof filter === "function") {
            newItem = filter(newItem, element.value, column)
          } else {
            const value = newItem[element.code]
            const finx = (element.value || []).includes(value)
            // 找不到相等数据的时候
            if (!finx) {
              newItem = false
              break;
            }
          }
        }

        return !!newItem
      })
    }

    /**列处理*/
    function processColumns(columns: ArtColumn[]) {
      return columns.map(dfs)
      function dfs(col: ArtColumn): ArtColumn {
        const result = { ...col }
        const filterTable = col.code && col.features?.filter;
        if (filterTable) {
          let items = filterTable?.items || []
          if (!filterTable?.items) {
            items = Array.from(new Set(dataSource.map((ite) => ite[col.code]))).filter((it => (it !== undefined && it !== null)))
          }
          result.title = (<DefaultFilterHeaderCell items={items} >
            {internals.safeRenderHeader(col)}
          </DefaultFilterHeaderCell>)
        }
        if (!isLeafNode(col)) {
          result.children = col.children.map(dfs)
        }
        return result
      }
    }
  }

}
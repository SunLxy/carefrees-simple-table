import { AbstractTreeNode, isLeafNode } from "ali-react-table"

/** 对树状结构的数据进行排序.
 * layeredFilter 是一个递归的过程，针对树上的每一个父节点，该函数都会重新对其子节点数组（children) 进行过滤.
 * */
export function layeredFilter<T extends AbstractTreeNode>(array: T[], compare: (x: T) => boolean): T[] {
  return dfs(array)

  function dfs(rows: T[]): T[] {
    if (!Array.isArray(array)) {
      return array
    }
    return rows
      .map((row) => {
        if (isLeafNode(row)) {
          return row
        }
        return { ...row, children: dfs(row.children as T[]) }
      })
      .filter(compare)
  }
}

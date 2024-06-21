
import { AbstractTreeNode, ArtColumn } from "ali-react-table"

function groupBy<T extends AbstractTreeNode>(array: T[], key: string) {
  const result = {};
  for (let index = 0; index < array.length; index++) {
    const itemData = array[index];
    const value = itemData[key];
    if (!result[value]) {
      result[value] = [];
    }
    result[value].push(itemData);
  }
  return result;
}

/** 对树状结构的数据进行分组.
 * layeredGroup 是一个递归的过程，
 * */
export function layeredGroup<T extends AbstractTreeNode>(array: T[], oldGroup: ArtColumn[], primaryKey: string | ((row: any) => string), parentKey: string = '', level: number = 0): T[] {
  const group = [...oldGroup]
  // 每次取第一个进行分组，剩余的进行二次循环
  const firstGroupItem = group.shift()
  if (firstGroupItem) {
    const newParentKey = parentKey ? parentKey + "_" + firstGroupItem.code : firstGroupItem.code
    const groupData = groupBy<T>(array, firstGroupItem.code)
    const groupByKeys = Object.keys(groupData);
    const lg = groupByKeys.length
    const newArray: T[] = []

    for (let index = 0; index < lg; index++) {
      const itemKey = groupByKeys[index];
      const groupItemList = (groupData[itemKey] || []).map((item: ArtColumn) => {
        return { ...item, ___default_level: level }
      })
      const value = groupItemList[0][firstGroupItem.code]
      const rowKey = typeof primaryKey === "function" ? primaryKey(groupItemList[0]) : primaryKey
      const valueKey = groupItemList[0][rowKey]

      if (group.length) {
        const list = layeredGroup<T>(groupItemList, group, primaryKey, newParentKey, level + 1)
        newArray.push({
          children: list,
          __custom_group__: value,
          [firstGroupItem.code]: value,
          [rowKey]: valueKey + "_" + value + "_" + newParentKey + "_" + level,
          ___level: level,
          ___isGroup: true,
        } as undefined as T)
      } else {
        newArray.push({
          children: groupItemList,
          __custom_group__: value,
          [firstGroupItem.code]: value,
          [rowKey]: valueKey + "_" + value + "_" + newParentKey + "_" + level,
          ___level: level,
          ___isGroup: true,
        } as undefined as T)
      }
    }
    return newArray
  }
  return array
}

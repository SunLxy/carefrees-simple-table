import React from 'react';
import { useTablePipeline, BaseTable, ArtColumn, features, CustomGroup } from "@carefrees/simple-table"

const dataSource3: any[] = [
  { id: "1", a: "1", name2: "3", name3: "3", name4: "name22" },
  { id: "2", a: "cdacdsacdsacdsacdsacdsacdsacdsa", name2: "2", name3: "3", name4: "name22" },
  { id: "4", a: "1", name2: "2", name3: "3", name4: "name22" },
  { id: "5", a: "1", name2: "6", name3: "3", name4: "name22" },
  { id: "6", a: "3", name2: "2", name3: "3", name4: "name22" },
  { id: "7", a: "1", name2: "4", name3: "3", name4: "name22" },
  { id: "8", a: "1", name2: "2", name3: "3", name4: "name22" },
  { id: "9", a: "3", name2: "5", name3: "3", name4: "name22" },
  { id: "10", a: "3", name2: "5", name3: "3", name4: "name22" },
]

const columns3: ArtColumn[] = [
  {
    code: "a",
    name: "a",
  },
  {
    name: "name2",
    code: "name2",
    width: 200
  },
  {
    code: "name3",
    name: "name3",
    width: 900
  },
  {
    code: "name4",
    name: "name4",
    width: 500
  },
  {
    code: "name3",
    name: "name3",
    width: 900
  },
  {
    code: "name3",
    name: "name3",
    width: 600
  }
]


const Route = () => {
  // 多级分组要换组件
  const pipeline3 = useTablePipeline()
    .input({ dataSource: dataSource3, columns: columns3 })
    .primaryKey('id') // 每一行数据由 id 字段唯一标记
    .use(CustomGroup({ groupItems: [{ code: "a", name: "a" }, { code: "name2", name: "name2" }] }))
    .use(features.treeMode({}))
  const tableProps3 = pipeline3.getProps()
  console.log('tableProps3', tableProps3)
  return (
    <React.Fragment>
      <BaseTable isCustomGroup  {...tableProps3} />
    </React.Fragment>
  );
};

export default Route;

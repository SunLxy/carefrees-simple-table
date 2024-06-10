import React from 'react';
import { Button, useTablePipeline, BaseTable, ArtColumn, filter, exportExcel, features, CustomGroup } from "@carefrees/simple-table"

const dataSource: any[] = [
  { id: "1", name: "1", name2: "2", name3: "3", name22: "name22" },
  { id: "2", name: "0", name2: "2", name3: "3", name22: "name22" },
  { id: "3", name: "3", name2: "2", name3: "3", name22: "name22" },
]

const dataSource2: any[] = [
  {
    id: "1",
    name: "分组1",
    name2: "分组1",
    children: [
      { id: "2", name: "分组1-1", name2: "分组1-1-1", name3: "分组1-1-3", name22: "分组1-1-4", },
      { id: "3", name: "分组1-2", name2: "分组1-2-1", name3: "分组1-2-3", name22: "分组1-2-4", },
    ]
  },
  {
    id: "4",
    name: "分组2",
    name2: "分组2",
    children: [
      { id: "5", name: "分组2-1", name2: "分组2-1-2", name3: "分组2-1-3", name22: "分组2-1-4", },
      { id: "6", name: "分组2-2", name2: "分组2-2-2", name3: "分组2-2-3", name22: "分组2-2-4", }
    ]
  },
]


const dataSource3: any[] = [
  { id: "1", a: "1", name2: "3", name3: "3", name4: "name22" },
  { id: "2", a: "0", name2: "2", name3: "3", name4: "name22" },
  { id: "4", a: "1", name2: "2", name3: "3", name4: "name22" },
  { id: "5", a: "1", name2: "6", name3: "3", name4: "name22" },
  { id: "6", a: "3", name2: "2", name3: "3", name4: "name22" },
  { id: "7", a: "1", name2: "4", name3: "3", name4: "name22" },
  { id: "8", a: "1", name2: "2", name3: "3", name4: "name22" },
  { id: "9", a: "3", name2: "5", name3: "3", name4: "name22" },
  { id: "10", a: "3", name2: "5", name3: "3", name4: "name22" },
]

const columns2: ArtColumn[] = [
  {
    code: "name",
    name: "name",
  },
  {
    name: "name2",
    code: "name2",
  },
  {
    code: "name3",
    name: "name3",
  }
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


const columns: ArtColumn[] = [
  {
    code: "name",
    name: "name",
    width: 100,
    features: { filter: true },
    getSpanRect: (value, row, rowIndex) => {
      const top = 0;
      const left = 0;
      const bottom = 3;
      const right = 1;
      return { top, left, bottom, right }
    }
  },
  {
    name: "names",
    children: [
      {
        code: "name2",
        name: "name2",
        width: 200,
        children: [
          {
            code: "name2",
            name: "name2",
            width: 200,
            getSpanRect: (value, row, rowIndex) => {
              const top = rowIndex;
              const left = 1;
              const bottom = rowIndex + 1;
              const right = 3;
              return { top, left, bottom, right }
            }
          },
          {
            code: "name2",
            name: "name2",
            width: 200,
          }
        ]
      },
      {
        code: "name22",
        name: "name22",
        width: 200,
        getSpanRect: (value, row, rowIndex) => {
          let top = rowIndex;
          const left = 3;
          let bottom = rowIndex + 1;
          const right = 4;
          if (rowIndex === 1 || rowIndex === 0) {
            top = 0
            bottom = 2
          }
          return { top, left, bottom, right }
        }
      },
      {
        code: "name2",
        name: "name2",
        width: 200,
      }
    ]
  },
  {
    name: "names1",
    children: [
      {
        code: "name2",
        name: "name2",
        width: 200,
      },
      {
        code: "name2",
        name: "name2",
        width: 200,
      },
      {
        code: "name2",
        name: "name2",
        width: 200,
      }
    ]
  },
  {
    code: "name3",
    name: "name3",
  }
]

const Route = () => {
  // const [value, setValue] = useState<any[]>([])

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id') // 每一行数据由 id 字段唯一标记
    .use(filter())
  const tableProps = pipeline.getProps()

  const pipeline2 = useTablePipeline()
    .input({ dataSource: dataSource2, columns: columns2 })
    .primaryKey('id') // 每一行数据由 id 字段唯一标记
    .use(features.rowGrouping({ defaultOpenAll: true }))

  const tableProps2 = pipeline2.getProps()


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
      <hr />
      <Button onClick={() => exportExcel({ columns: tableProps.columns, dataSource: tableProps.dataSource, })} >基础表格导出</Button>
      <BaseTable  {...tableProps} />
      <hr />
      <Button onClick={() => exportExcel({ columns: columns2, dataSource: dataSource2, groupColumns: [{ code: "name2", name: "name2" }] })}  >分组表格导出</Button>
      <BaseTable  {...tableProps2} />
      <hr />
      <BaseTable  {...tableProps3} />
    </React.Fragment>
  );
};

export default Route;

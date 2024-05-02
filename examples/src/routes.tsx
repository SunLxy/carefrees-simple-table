import React, { useState } from 'react';
import { CheckBox, CheckBoxGroup, Button, useTablePipeline, BaseTable, ArtColumn, filter, exportExcel } from "@carefrees/simple-table"

const dataSource: any[] = [
  { name: "1", name2: "2", name3: "3", name22: "name22" },
  { name: "0", name2: "2", name3: "3", name22: "name22" },
  { name: "3", name2: "2", name3: "3", name22: "name22" },
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
  const [value, setValue] = useState<any[]>([])

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id') // 每一行数据由 id 字段唯一标记
    .use(filter())

  const tableProps = pipeline.getProps()


  return (
    <React.Fragment>
      <Button onClick={() => exportExcel({ columns: tableProps.columns, dataSource: tableProps.dataSource })} >导出</Button>
      <CheckBox checked />
      <CheckBox />
      <CheckBox indeterminate />
      <CheckBoxGroup value={value} items={['a', 'b', 'c']} onChange={(list) => setValue(list as any[])} />

      <BaseTable  {...tableProps} />


    </React.Fragment>
  );
};

export default Route;

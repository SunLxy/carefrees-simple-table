import React, { useState } from 'react';
import { CheckBox, CheckBoxGroup, Button, useTablePipeline, BaseTable, ArtColumn, filter, exportExcel } from "@carefrees/simple-table"

const dataSource: any[] = [
  { name: "1", name2: "2", name3: "3" },
  { name: "0", name2: "2", name3: "3" },
  { name: "3", name2: "2", name3: "3" },
]

const columns: ArtColumn[] = [
  {
    code: "name",
    name: "name",
    features: { filter: true }
  },
  {
    code: "name2",
    name: "name2",
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

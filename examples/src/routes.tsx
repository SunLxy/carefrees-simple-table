import React, { useState } from 'react';
import { CheckBox, CheckBoxGroup, Button } from "@carefrees/simple-table"

const Route = () => {
  const [value, setValue] = useState<any[]>([])

  return (
    <React.Fragment>
      <Button>内容</Button>
      <CheckBox checked />
      <CheckBox />
      <CheckBox indeterminate />
      <CheckBoxGroup value={value} items={['a', 'b', 'c']} onChange={(list) => setValue(list as any[])} />
    </React.Fragment>
  );
};

export default Route;

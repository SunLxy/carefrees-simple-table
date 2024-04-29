import React, { useState } from 'react';
import { CheckBox, CheckBoxGroup } from "@carefrees/simple-table"

const Route = () => {
  const [value, setValue] = useState<any[]>([])

  return (
    <React.Fragment>
      <CheckBox checked />
      <CheckBox />
      <CheckBoxGroup value={value} items={['a', 'b', 'c']} onChange={(list) => setValue(list as any[])} />
    </React.Fragment>
  );
};

export default Route;

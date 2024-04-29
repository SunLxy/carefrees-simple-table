import React from 'react';
import SimpleMenu from "@carefrees/simple-menu"

const menus = [
  { title: "展示1", path: "/test1" },
  {
    title: "展示2", path: "/test2",
    children: [
      { title: "展示2-1", path: "/test2-1" },
      { title: "展示2-2", path: "/test2-2" },
      {
        title: "展示2-3", path: "/test2-3",
        children: [
          { title: "展示2-3-1", path: "/test2-3-1", },
          { title: "展示2-3-2", path: "/test2-3-2", },
        ]

      },
      { title: "展示2-4", path: "/test2-4" },
    ]
  },
  { title: "展示3", path: "/test3" },
  { title: "展示4", path: "/test4" },
]

const Route = () => {
  return (
    <React.Fragment>
      <SimpleMenu
        isExpand
        items={menus}
      />
    </React.Fragment>
  );
};
export default Route;

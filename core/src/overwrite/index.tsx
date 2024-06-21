import { forwardRef } from "react"
import { BaseTable as ArtBaseTable, BaseTableProps as BaseTablePropsType } from "ali-react-table";
import styled from "styled-components";
export * from "ali-react-table"

const ArtTableStyled = styled(ArtBaseTable)`
  .careress__custom_group__lock_td.art-table-cell .expansion-cell {
    position: sticky;
    left: var(--custom_group-cell-padding-left);
  }
  &.carefress-simple-table-base.custom_group .art-lock-shadow-mask {
    .art-lock-shadow.art-left-lock-shadow{
        box-shadow:none;
        border-right: 0px;
        border-left:var(--cell-border-vertical) ;
    }
  }
`

export interface BaseTableProps extends BaseTablePropsType {
  style?: BaseTablePropsType['style'] & {
    /**分组固定列*/
    '--custom_group-cell-padding-left'?: string
  }
  /**自定义分组*/
  isCustomGroup?: boolean

}

export const BaseTable = forwardRef<ArtBaseTable, BaseTableProps>((props, ref) => {
  const { isCustomGroup, ...rest } = props
  return <ArtTableStyled
    {...rest}
    ref={ref}
    className={`carefress-simple-table-base ${isCustomGroup ? "custom_group" : ""} ${props.className || ''}`}
    style={{ "--custom_group-cell-padding-left": '13px', ...props.style } as any}
    getRowProps={(row, rowindex) => {
      let rowProps: React.HTMLAttributes<HTMLTableRowElement> = {}
      if (props.getRowProps) {
        rowProps = props.getRowProps(row, rowindex)
      }
      if (rowProps && row.___isGroup) {
        rowProps.className = `careress__custom_group__lock_tr ${rowProps.className || ''}`
      } else if (row.___isGroup) {
        rowProps = {}
        rowProps.className = `careress__custom_group__lock_tr`
      }
      return rowProps
    }}
  />
})
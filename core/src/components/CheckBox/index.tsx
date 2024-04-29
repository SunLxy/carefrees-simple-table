import styled, { css } from "styled-components"


const CheckBoxWarp = styled.label<{ $checked: boolean }>`
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: #000;
  font-size: 12px;
  list-style: none;
  display: inline-flex;
  align-items: baseline;
  cursor: pointer;

  ${props => props.$checked && css`
    ${CheckBoxInner}{
      background-color: #1677ff;
      border-color: #1677ff;
      &::after{
        opacity: 1;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
      }
    }
  `}
`

const CheckBoxBody = styled.span`
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color:#000;
  font-size: 12px;
  list-style: none;
  position: relative;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 4px;
  align-self: center;
`

const CheckBoxBase = styled.input`
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
  opacity: 0;
  margin: 0;
`

const CheckBoxInner = styled.span`
  box-sizing: border-box;
  display: block;
  width:16px;
  height:16px;
  direction: ltr;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  border-collapse: separate;
  transition: all 0.3s;

  &::after{
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    inset-inline-start: 25%;
    display: table;
    width: calc(16px / 14* 5);
    height: calc(16px / 14* 8);
    border: 2px solid #fff;
    border-top: 0;
    border-inline-start: 0;
    transform: rotate(45deg) scale(0) translate(-50%, -50%);
    opacity: 0;
    content: "";
    transition: all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6), opacity 0.1s;
  }

`

export interface CheckBoxProps {
  checked?: boolean
  onClick?: React.MouseEventHandler<HTMLLabelElement>
}

export const CheckBox = (props: CheckBoxProps) => {
  const { checked = false, onClick } = props
  return (<CheckBoxWarp onClick={onClick} $checked={checked} className="carefrees-simple-table-check-box">
    <CheckBoxBody className="carefrees-simple-table-check-box-body">
      <CheckBoxBase className="carefrees-simple-table-check-box-input" type="checkbox" />
      <CheckBoxInner className="carefrees-simple-table-check-box-inner" />
    </CheckBoxBody>
  </CheckBoxWarp>)
}

const CheckBoxGroupBase = styled.div`

`
const CheckBoxGroupItemBase = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 2px 5px;
  ${props => props.$checked && css`
    background-color: #e6f4ff;
    border-radius: 4px;  
  `}
`
const CheckBoxGroupItemTextBase = styled.span`
  padding:0px 5px ;
  box-sizing: border-box;
`

export interface CheckBoxGroupProps {
  value?: (string | number | undefined | null)[]
  items?: any[]
  valueField?: string
  labelField?: string
  onChange?: (list: CheckBoxGroupProps['value'], item: any, checked: boolean) => void
}

export const CheckBoxGroup = (props: CheckBoxGroupProps) => {
  const { items = [], value = [], valueField = 'value', labelField = 'label', onChange } = props
  const onClick = (event: React.MouseEvent<HTMLLabelElement, MouseEvent>, checked: boolean, item: any, isStringOrNumber: boolean) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    let list: CheckBoxGroupProps['value'] = []
    const valueText = isStringOrNumber ? item : item?.[valueField]
    if (checked) {
      list = value.filter(it => it !== valueText);
    } else {
      list = value.concat([valueText])
    }
    onChange?.(list, item, !!checked)
  }

  return (<CheckBoxGroupBase className="carefrees-simple-table-check-box-group">
    {items?.map((item, key) => {
      const isStringOrNumber = typeof item === "string" || typeof item === "number" || typeof item === "boolean"
      const checked = value.includes(isStringOrNumber ? item : item?.[valueField])
      const text = isStringOrNumber ? item : item?.[labelField]
      return <CheckBoxGroupItemBase $checked={checked} className="carefrees-simple-table-check-box-group-list-item" key={key} >
        <CheckBox onClick={(event) => onClick(event, checked, item, isStringOrNumber)} checked={checked} />
        <CheckBoxGroupItemTextBase className="carefrees-simple-table-check-box-group-list-item-text">{text}</CheckBoxGroupItemTextBase>
      </CheckBoxGroupItemBase>
    })}
  </CheckBoxGroupBase>)

}
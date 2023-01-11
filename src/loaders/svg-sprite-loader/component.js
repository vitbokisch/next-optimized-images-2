/* eslint-disable */
import { createElement } from 'react'
import SpriteSymbol from '$$symbolRequest$$'
import sprite from '$$spriteRequest$$'

var symbol = new SpriteSymbol($$stringifiedSymbol$$)
sprite.add(symbol)

var SvgSpriteIcon = function SvgSpriteIcon(props) {
  return createElement(
    'svg',
    Object.assign(
      {
        viewBox: symbol.viewBox,
      },
      props
    ),
    createElement('use', {
      xlinkHref: '#' + symbol.id,
    })
  )
}

SvgSpriteIcon.viewBox = symbol.viewBox
SvgSpriteIcon.id = symbol.id
SvgSpriteIcon.content = symbol.content
SvgSpriteIcon.url = symbol.url
SvgSpriteIcon.toString = symbol.toString

export { SvgSpriteIcon }
export default SvgSpriteIcon

import React, { PureComponent } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

const instanceRefs = new BehaviorSubject([])

const pressKey$ = Observable.fromEvent(document, 'keydown').map(
  e => e.which || e.keyCode
)

const lastRef$ = instanceRefs.map(refs => refs[refs.length - 1])

pressKey$.withLatestFrom(lastRef$).subscribe(([key, last]) => {
  if (last) {
    const { onConfirm, onClose } = last.props
    if (key === 13) onConfirm && onConfirm()
    if (key === 27) onClose && onClose()
  }
})

export class PureDialog extends PureComponent {
  componentDidMount() {
    const value = instanceRefs.value
    value.push(this)

    instanceRefs.next(value)
  }

  componentWillUnmount() {
    const value = instanceRefs.value
    value.pop()
    instanceRefs.next(value)
  }

  render() {
    const {
      onClickLayer,
      children = 'aaa',
      style,
      showClose,
      onClose,
      onConfirm,
      zIndexShift = 0 // dialog上还有dialog需要加偏移
    } = this.props

    return (
      <div ref="mainDiv">
        <div
          onClick={onClickLayer}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.541176)',
            zIndex: 1008 + zIndexShift,
            position: 'fixed',
            left: '0',
            top: '0',
            right: '0',
            bottom: '0',
          }}
        />
        <div
          style={{
            borderRadius: '2px',
            position: 'fixed',
            zIndex: 1009 + zIndexShift,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            ...style,
          }}
        >
          <div>{children}</div>
          {showClose && (
            <span
              onClick={onClose}
              style={{
                cursor: 'pointer',
                width: '35px',
                height: '40px',
                fill: '#cccccc',
                position: 'absolute',
                top: '5px',
                right: '-40px',
              }}
            >
              x
            </span>
          )}
        </div>
        <style>
          {`
        body{
          overflow: hidden;
        }
        `}
        </style>
      </div>
    )
  }
}

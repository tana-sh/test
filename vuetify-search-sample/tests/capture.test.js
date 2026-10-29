import test from 'node:test'
import assert from 'node:assert/strict'
import { bindCaptureShortcut, copyViewportToClipboard } from '../src/utils/capture.js'

test('plain F3 cancels browser search; repeats/modifiers are ignored; cleanup removes listener', () => {
  let listener, count = 0, enabled = true
  const target = {
    addEventListener(name, handler, capture) { assert.equal(name, 'keydown'); assert.equal(capture, true); listener = handler },
    removeEventListener(name, handler, capture) { assert.equal(handler, listener); assert.equal(capture, true); listener = undefined },
  }
  const cleanup = bindCaptureShortcut(target, { capture() { count++ }, canCapture: () => enabled })
  const press = (props = {}) => {
    const event = { key: 'F3', defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, ...props }
    listener?.(event)
    return event
  }
  assert.equal(press().defaultPrevented, true)
  assert.equal(count, 1)
  assert.equal(press({ repeat: true }).defaultPrevented, true)
  for (const props of [{ key: 'F2' }, { ctrlKey: true }, { altKey: true }, { shiftKey: true }, { metaKey: true }, { isComposing: true }]) assert.equal(press(props).defaultPrevented, false)
  enabled = false
  assert.equal(press().defaultPrevented, true)
  assert.equal(count, 1)
  cleanup()
  enabled = true
  press()
  assert.equal(count, 1)
})

function fixture({ denied = false, nullBlob = false } = {}) {
  const order = []
  const png = new Blob(['test png'], { type: 'image/png' })
  let settings
  const win = {
    isSecureContext: true,
    scrollX: 10, scrollY: 240, innerWidth: 852, innerHeight: 393, devicePixelRatio: 2,
    document: { documentElement: {}, fonts: { ready: Promise.resolve() } },
    ClipboardItem: class {
      static supports(type) { return type === 'image/png' }
      constructor(types) { this.types = types }
    },
    navigator: { clipboard: { write(items) {
      order.push('write')
      if (denied) return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
      return items[0].types['image/png'].then(blob => { assert.equal(blob, png); order.push('copied') })
    } } },
  }
  const render = async (element, options) => {
    order.push('render')
    assert.equal(element, win.document.documentElement)
    settings = options
    return { toBlob(callback, type) { assert.equal(type, 'image/png'); callback(nullBlob ? null : png) } }
  }
  return { win, render, order, settings: () => settings }
}

test('clipboard write starts synchronously before rendering, preserving user activation', async () => {
  const f = fixture()
  const copying = copyViewportToClipboard({ windowObject: f.win, render: f.render })
  assert.deepEqual(f.order, ['write'])
  await copying
  assert.deepEqual(f.order, ['write', 'render', 'copied'])
  assert.equal(f.settings().x, 10)
  assert.equal(f.settings().y, 240)
  assert.equal(f.settings().width, 852)
  assert.equal(f.settings().height, 393)
  assert.equal(f.settings().scale, 2)
})

test('unavailable/insecure clipboard is rejected before rendering', async () => {
  const f = fixture()
  f.win.isSecureContext = false
  await assert.rejects(copyViewportToClipboard({ windowObject: f.win, render: f.render }), /HTTPS/)
  f.win.isSecureContext = true
  f.win.navigator.clipboard = undefined
  await assert.rejects(copyViewportToClipboard({ windowObject: f.win, render: f.render }), /対応/)
  assert.deepEqual(f.order, [])
})

test('denied clipboard and failed PNG generation reject instead of reporting success', async () => {
  const denied = fixture({ denied: true })
  await assert.rejects(copyViewportToClipboard({ windowObject: denied.win, render: denied.render }), { name: 'NotAllowedError' })
  const failed = fixture({ nullBlob: true })
  await assert.rejects(copyViewportToClipboard({ windowObject: failed.win, render: failed.render }), /画像を作成できません/)
})

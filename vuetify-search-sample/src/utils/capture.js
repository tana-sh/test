function renderPage(element, options) {
  return import('html2canvas').then(({ default: html2canvas }) => html2canvas(element, options))
}

export function bindCaptureShortcut(target, { capture, canCapture = () => true }) {
  function onKeydown(event) {
    if (event.key !== 'F3' || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey || event.isComposing || event.defaultPrevented) return
    event.preventDefault()
    if (!event.repeat && canCapture()) capture()
  }
  target.addEventListener('keydown', onKeydown, true)
  return () => target.removeEventListener('keydown', onKeydown, true)
}

// Returning the write Promise (rather than awaiting the canvas first) preserves
// user activation in browsers such as Safari.
export function copyViewportToClipboard({ windowObject = window, render = renderPage } = {}) {
  const win = windowObject
  const clipboard = win.navigator.clipboard
  if (!win.isSecureContext) return Promise.reject(new Error('画面コピーにはHTTPSまたはlocalhostでの接続が必要です。'))
  if (!clipboard?.write || !win.ClipboardItem) return Promise.reject(new Error('このブラウザでは画像のクリップボードコピーに対応していません。'))
  if (typeof win.ClipboardItem.supports === 'function' && !win.ClipboardItem.supports('image/png')) {
    return Promise.reject(new Error('このブラウザではPNG画像のコピーに対応していません。'))
  }

  // Snapshot coordinates before asynchronous rendering; do not scroll during copying.
  const options = {
    x: win.scrollX, y: win.scrollY,
    width: win.innerWidth, height: win.innerHeight,
    windowWidth: win.innerWidth, windowHeight: win.innerHeight,
    scrollX: win.scrollX, scrollY: win.scrollY,
    scale: win.devicePixelRatio || 1,
    backgroundColor: '#F3F6FA',
    useCORS: true, allowTaint: false, logging: false,
    ignoreElements: element => element.hasAttribute('data-capture-ignore'),
  }
  const image = Promise.resolve(win.document.fonts?.ready)
    .then(() => render(win.document.documentElement, options))
    .then(canvas => new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob
        ? resolve(blob)
        : reject(new Error('画像を作成できませんでした。')), 'image/png')
    }))
  // Handle rendering rejection even if clipboard.write itself is denied early.
  image.catch(() => {})
  try {
    return Promise.resolve(clipboard.write([new win.ClipboardItem({ 'image/png': image })]))
  } catch (error) {
    return Promise.reject(error)
  }
}

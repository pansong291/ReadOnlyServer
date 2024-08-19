;(function () {
  const { createElem, qs } = window.paso.function
  const { mirrorDomain } = window.paso.data
  const strs = {
    emojiWrapperPrefix: 'paso-emoji-wrapper-',
    emojiSwitcherPrefix: 'paso-emoji-switcher-',
    githubPath: '/pansong291/Pictures/e56f47953bd9e4f1aff4110b1ccf5c1032ac48cd/emoji',
  }
  const emojiMap = new Proxy({
    '1呵呵': '1',
    '1哈哈': '2',
    '1吐舌': '3',
    '1啊': '4',
    '1酷': '5',
    '1怒': '6',
    '1开心': '7',
    '1汗': '8',
    '1泪': '9',
    '1黑线': '10',
    '1鄙视': '11',
    '1不高兴': '12',
    '1真棒': '13',
    '1钱': '14',
    '1疑问': '15',
    '1阴险': '16',
    '1吐': '17',
    '1咦': '18',
    '1委屈': '19',
    '1花心': '20',
    '1呼~': '21',
    '1笑眼': '22',
    '1冷': '23',
    '1太开心': '24',
    '1滑稽': '25',
    '1勉强': '26',
    '1狂汗': '27',
    '1乖': '28',
    '1睡觉': '29',
    '1惊哭': '30',
    '1升起': '31',
    '1惊讶': '32',
    '1喷': '33',
    '2hi': '1',
    '2no': '2',
    '2耶': '3',
    '2切': '4',
    '2吃饭': '5',
    '2吃面': '6',
    '2呕吐': '7',
    '2忙': '8',
    '2哈哈': '9',
    '2haha': '10',
    '2害羞': '11',
    '2汗': '12',
    '2点赞': '13',
    '2鼓掌': '14',
    '2受伤': '15',
    '2流泪': '16',
    '2抠鼻': '17',
    '2尴尬': '18',
    '2贪吃': '19',
    '2哇': '20',
    '2疑问': '21',
    '2阴险': '22',
    '2晕': '23',
    '2撒娇': '24',
    '2嗯嗯': '25'
  }, {
    get(target, p) {
      const value = target[p]
      const num = parseInt(p)
      if (value && num) {
        switch (num) {
          case 1:
            return `${mirrorDomain}${strs.githubPath}/baidu-tieba/f${value}.png`
          case 2:
            return `${mirrorDomain}${strs.githubPath}/uc-bbs/${value}.gif`
        }
      }
      return value
    }
  })

  const replaceEmoji = (elem) => {
    if (elem.nodeType === Node.TEXT_NODE) {
      let hasEmoji = false
      const nodes = elem.nodeValue.split(/(\/\d+[^\s\/]+)/gu).map((s) => {
        if (s.startsWith('/')) {
          const alt = s.substring(1)
          const src = emojiMap[alt]
          if (src) {
            hasEmoji = true
            return createElem('img', { alt, src })
          }
        }
        return s
      })
      if (hasEmoji) {
        elem.after.apply(elem, nodes)
        elem.remove()
      }
    }
    if (elem.hasChildNodes()) {
      for (const sub of elem.childNodes) {
        replaceEmoji(sub)
      }
    }
  }

  const elements = {}
  elements.comment_wrapper = qs('#paso-comments')
  elements.comment_form = qs('#paso-comments > form')
  // 未登录且不允许匿名时不存在表单
  if (!elements.comment_form) return replaceEmoji(elements.comment_wrapper)

  document.head.insertAdjacentHTML('beforeend', `
    <style>
      #paso-emoji-controller {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: stretch;
        gap: 8px;
      }
      .emoji-wrapper {
        padding-top: 8px;
      }
      .emoji-wrapper img {
        cursor: pointer;
      }
      .emoji-wrapper img:hover:not(:active) {
        outline: 1px solid #0000ee;
      }
      .emoji-wrapper img:active {
        outline: 1px solid #ff0000;
      }
      .wo-reply-textarea {
        display: block;
        margin: 8px 0;
      }
    </style>`)
  // 初始化 controller, exhibitor
  elements.emoji_controller = createElem('div', { id: 'paso-emoji-controller' })
  elements.emoji_exhibitor = createElem('div', { id: 'paso-emoji-exhibitor' })
  elements.textarea = elements.comment_form.querySelector('textarea')
  // 移除表单中不必要的元素
  const formChildren = Array.from(elements.comment_form.childNodes)
  while (formChildren.length) {
    const node = formChildren.pop()
    if (node.nodeType === Node.ELEMENT_NODE && ['input', 'textarea'].includes(node.tagName.toLowerCase())) continue
    node.remove()
  }
  // 设置表单宽高
  elements.textarea.setAttribute('cols', '30')
  elements.textarea.setAttribute('rows', '5')

  const emojiNums = new Set()

  const onEmojiSwitch = (e) => {
    const num = typeof e === 'number' ? e : typeof e === 'string' ? parseInt(e) : parseInt(e.currentTarget.dataset.num)
    const wrapperId = strs.emojiWrapperPrefix + num
    let show
    if (!elements[wrapperId]) {
      show = true
      // 懒加载 emoji-wrapper
      elements[wrapperId] = createElem('div', { id: wrapperId, class: 'emoji-wrapper' })
      for (const alt in emojiMap) {
        if (!alt.startsWith(num)) continue
        const emojiElem = createElem('img', { alt, src: emojiMap[alt] })
        emojiElem.addEventListener('click', onEmojiSelected)
        elements[wrapperId].append(emojiElem)
      }
      elements.emoji_exhibitor.append(elements[wrapperId])
    } else {
      show = elements[wrapperId].style.display === 'none'
    }
    // 切换 emoji-wrapper 的显示
    emojiNums.forEach((n) => {
      const el = elements[strs.emojiWrapperPrefix + n]
      if (el) el.style.display = n === num && show ? 'block' : 'none'
    })
  }
  const onEmojiSelected = (e) => {
    const alt = e.currentTarget.alt
    onEmojiSwitch(alt)
    elements.textarea.focus()
    elements.textarea.setRangeText('/' + alt + ' ', elements.textarea.selectionStart, elements.textarea.selectionEnd, 'end')
  }

  elements.comment_form.addEventListener('submit', () => {
    if (elements.textarea.value) return true
    elements.textarea.focus()
    return false
  })
  // 初始化 switcher
  for (const k in emojiMap) {
    const emojiNum = parseInt(k)
    emojiNums.add(emojiNum)
    const switcherId = strs.emojiSwitcherPrefix + emojiNum
    if (!elements[switcherId]) {
      elements[switcherId] = createElem('a', {
        id: switcherId,
        ['data-num']: emojiNum,
        href: 'javascript:0;'
      }, ['表情' + emojiNum])
      elements[switcherId].addEventListener('click', onEmojiSwitch)
      elements.emoji_controller.append(elements[switcherId])
    }
  }

  replaceEmoji(elements.comment_wrapper)
  elements.textarea.before(elements.emoji_controller, elements.emoji_exhibitor)
}())

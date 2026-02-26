import { useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import { translateText } from './translations'

const textOriginalMap = new WeakMap<Text, string>()

function applyTranslationToTextNode(node: Text, locale: 'ko' | 'en') {
  const original = textOriginalMap.get(node) ?? node.nodeValue ?? ''
  if (!textOriginalMap.has(node)) {
    textOriginalMap.set(node, original)
  }

  const nextValue = locale === 'ko' ? original : translateText(original, locale)
  if (node.nodeValue !== nextValue) {
    node.nodeValue = nextValue
  }
}

function applyTranslationToElementAttributes(el: Element, locale: 'ko' | 'en') {
  const htmlEl = el as HTMLElement
  const attrs = ['placeholder', 'title', 'aria-label']

  attrs.forEach(attr => {
    const current = el.getAttribute(attr)
    if (!current) return

    const dataKey = `i18nOrig${attr.replace(/(^|-)([a-z])/g, (_, __, p2) => p2.toUpperCase())}`
    const original = htmlEl.dataset[dataKey] ?? current
    if (!htmlEl.dataset[dataKey]) {
      htmlEl.dataset[dataKey] = original
    }

    const translated = locale === 'ko' ? original : translateText(original, locale)
    if (current !== translated) {
      el.setAttribute(attr, translated)
    }
  })
}

function translateSubtree(root: Node, locale: 'ko' | 'en') {
  if (root.nodeType === Node.TEXT_NODE) {
    applyTranslationToTextNode(root as Text, locale)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current) {
    const parent = current.parentElement
    if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
      applyTranslationToTextNode(current as Text, locale)
    }
    current = walker.nextNode()
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    applyTranslationToElementAttributes(root as Element, locale)
  }

  const elementWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  let elNode = elementWalker.nextNode()
  while (elNode) {
    applyTranslationToElementAttributes(elNode as Element, locale)
    elNode = elementWalker.nextNode()
  }
}

export default function DomI18nBridge() {
  const { locale } = useLanguage()

  useEffect(() => {
    let isApplying = false

    const applyAll = () => {
      isApplying = true
      translateSubtree(document.body, locale)
      isApplying = false
    }

    applyAll()

    const observer = new MutationObserver(mutations => {
      if (isApplying) return
      isApplying = true

      for (const mutation of mutations) {
        if (mutation.type === 'characterData' && mutation.target) {
          translateSubtree(mutation.target, locale)
        }

        mutation.addedNodes.forEach(node => {
          translateSubtree(node, locale)
        })

        if (mutation.type === 'attributes' && mutation.target) {
          translateSubtree(mutation.target, locale)
        }
      }

      isApplying = false
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    })

    return () => {
      observer.disconnect()
    }
  }, [locale])

  return null
}

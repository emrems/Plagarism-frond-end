<template>
  <div>
    <h2 :class="['text-lg font-semibold mb-3 px-2 py-1 rounded inline-block', titleClass]">
      {{ title }}
    </h2>
    <div 
      class="prose max-w-none text-[1rem] bg-gray-50 border rounded-lg p-4 h-[400px] overflow-auto"
      @click="handleTextClick"
      ref="textContainer"
    >
      <div v-html="highlightedText"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'

interface MatchSpan {
  start1?: number
  start2?: number
  length: number
  id: string // Eşleşme için benzersiz ID
}

export default defineComponent({
  name: 'TextComparisonPane',
  props: {
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    matchSpans: {
      type: Array as () => MatchSpan[],
      default: () => []
    },
    highlightMode: {
      type: String,
      default: 'none'
    },
    type: {
      type: String as () => 'start1' | 'start2',
      required: true
    },
    color: {
      type: String as () => 'indigo' | 'purple',
      default: 'indigo'
    }
  },
  emits: ['span-clicked'],
  setup(props, { emit }) {
    const textContainer = ref<HTMLElement | null>(null)
    const titleClass = computed(() => {
      return props.color === 'indigo' 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'bg-purple-100 text-purple-700'
    })

    const highlightColors = computed(() => {
      return props.color === 'indigo' 
        ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 hover:bg-indigo-200 cursor-pointer' 
        : 'bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 cursor-pointer'
    })

    const highlightedText = computed(() => {
      if (!props.text || !props.matchSpans?.length) {
        return props.text.replace(/\n/g, '<br>')
      }

      const spans = [...props.matchSpans].sort((a, b) => (a[props.type] ?? 0) - (b[props.type] ?? 0))
      let result = ''
      let lastIndex = 0

      for (const span of spans) {
        const start = span[props.type] ?? 0
        const end = start + span.length
        const matched = props.text.slice(start, end)
        const unmatched = props.text.slice(lastIndex, start)

        if (props.highlightMode === 'match') {
          result += `<span class="${highlightColors.value}" data-span-id="${span.id}">${matched}</span>`
        } else if (props.highlightMode === 'diff') {
          result += unmatched.replace(/\n/g, '<br>')
        } else {
          result += unmatched.replace(/\n/g, '<br>') + 
                   `<span class="${highlightColors.value}" data-span-id="${span.id}">${matched}</span>`
        }
        lastIndex = end
      }

      return result + props.text.slice(lastIndex).replace(/\n/g, '<br>')
    })

    const handleTextClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'SPAN' && target.dataset.spanId) {
        emit('span-clicked', target.dataset.spanId)
      }
    }

    const scrollToSpan = (spanId: string) => {
      if (!textContainer.value) return
      
      const spanElement = textContainer.value.querySelector(`span[data-span-id="${spanId}"]`) as HTMLElement
      if (spanElement) {
        spanElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Geçici vurgulama efekti
        spanElement.classList.add('ring-2', 'ring-offset-2', 'ring-yellow-400')
        setTimeout(() => {
          spanElement.classList.remove('ring-2', 'ring-offset-2', 'ring-yellow-400')
        }, 1000)
      }
    }

    return {
      titleClass,
      highlightedText,
      handleTextClick,
      scrollToSpan,
      textContainer
    }
  }
})
</script>

<style scoped>
.prose :deep(span[data-span-id]) {
  box-decoration-break: clone;
  padding: 0.1em 0.2em;
  margin: 0 -0.1em;
  transition: background-color 0.2s ease;
}
</style>
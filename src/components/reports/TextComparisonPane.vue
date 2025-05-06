<template>
    <div>
      <h2 :class="['text-lg font-semibold mb-3 px-2 py-1 rounded inline-block', titleClass]">
        {{ title }}
      </h2>
      <div class="prose max-w-none text-[1rem] bg-gray-50 border rounded-lg p-4 h-[400px] overflow-auto">
        <div v-html="highlightedText"></div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue'
  
  interface MatchSpan {
    start1?: number
    start2?: number
    length: number
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
    setup(props) {
      const titleClass = computed(() => {
        return props.color === 'indigo' 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'bg-purple-100 text-purple-700'
      })
  
      const highlightColors = computed(() => {
        return props.color === 'indigo' 
          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' 
          : 'bg-purple-100 text-purple-900 border border-purple-200'
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
            result += `<span class="${highlightColors.value} px-1 rounded">${matched}</span>`
          } else if (props.highlightMode === 'diff') {
            result += unmatched.replace(/\n/g, '<br>')
          } else {
            result += unmatched.replace(/\n/g, '<br>') + 
                     `<span class="${highlightColors.value} px-1 rounded">${matched}</span>`
          }
          lastIndex = end
        }
  
        return result + props.text.slice(lastIndex).replace(/\n/g, '<br>')
      })
  
      return {
        titleClass,
        highlightedText
      }
    }
  })
  </script>
  
  <style scoped>
  .prose :deep(span) {
    box-decoration-break: clone;
    padding: 0.1em 0.2em;
    margin: 0 -0.1em;
  }
  </style>
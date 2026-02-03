Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {},

  methods: {
    onExpandFeature() {
      this.triggerEvent('expand')
    },
  },
})

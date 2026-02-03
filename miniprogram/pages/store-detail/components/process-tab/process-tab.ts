Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {},

  methods: {
    onViewAllProcess() {
      this.triggerEvent('viewAll')
    },
  },
})

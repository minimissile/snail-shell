Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {
    costRules: {
      type: Object,
      value: {
        deposit: {
          amount: 200,
        },
        extraPerson: {
          text: '标准入住6人,不可加人',
        },
      },
    },
  },

  data: {},

  methods: {
    onViewAllRules() {
      this.triggerEvent('viewAll')
    },
  },
})

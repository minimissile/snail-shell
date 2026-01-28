Component({
  properties: {
    avatarSrc: {
      type: String,
      value: '',
    },
    userName: {
      type: String,
      value: '',
    },
  },
  methods: {
    onMenu() {
      this.triggerEvent('menu')
    },
  },
})

export default defineAppConfig({
  pages: [
    'pages/profile/index',
    'pages/bills/index',
    'pages/rules/index',
    'pages/issues/index',
    'pages/checkout/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#20C997',
    navigationBarTitleText: '合租管家',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F7F9FC'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#20C997',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/profile/index',
        text: '档案'
      },
      {
        pagePath: 'pages/bills/index',
        text: '账单'
      },
      {
        pagePath: 'pages/rules/index',
        text: '规则'
      },
      {
        pagePath: 'pages/issues/index',
        text: '问题'
      },
      {
        pagePath: 'pages/checkout/index',
        text: '清算'
      }
    ]
  }
})

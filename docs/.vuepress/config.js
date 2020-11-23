module.exports = {
  title: '欢迎来到曾庆龙的博客',
  description: '持续学习',
  dest: './dist',
  port: '7777',
  base:'/vuepress-blog/dist/',
  head: [
  ],
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
      nav: require('./nav'),
      sidebar: require('./sidebar'),
      sidebarDepth: 2,
      lastUpdated: 'Last Updated',
      searchMaxSuggestoins: 16,
      serviceWorker: {
          updatePopup: {
              message: "有新的内容.",
              buttonText: '更新'
          }
      },
      editLinks: true,
      editLinkText: '在 GitHub 上编辑此页 ！'
  }
}

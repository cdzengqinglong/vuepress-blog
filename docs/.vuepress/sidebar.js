const fs = require('fs');
const path = require('path');

function getAllMdFilsSync(folders) {
  const absolutePath = path.resolve(__dirname,"../",...folders);
  let files = fs.readdirSync(absolutePath);
  files = files.filter(file => file.includes('.md'));
  files.forEach(file => file.replace('.md','.html'));
  const url = folders.reduce((pre,cur) => pre + cur + "/","/");
  files = files.map(file => `${url}${file}`);
  files = files.filter(file => file.toLowerCase().indexOf('readme') === -1);
  console.log(files);
  return files;
}


module.exports = {
  '/frontend/': [
    {
      title:"JavaScript",
      collapsable: true,
      children:getAllMdFilsSync(['frontend','javascript'])
    },
  ],
  '/notes/': [
    {
      title:"笔记",
      collapsable: true,
      children:getAllMdFilsSync(['notes'])
    },
  ]
}
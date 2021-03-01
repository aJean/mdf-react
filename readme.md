### mdf-react
将 mdfjs 里的 plugins-react 迁移到这，以后加的功能多了也要使用 workspace 模式

#### 开发流程
link 模块到项目，同时 pkg 里面也要加入 dependencies，这样 mdfjs 主模块会自动读取
- cd mdf-reaact
- yarn link
- cd mdf-demo
- yarn link @mdfjs/react

##### 注意
- create-mdfjs 模板里要加入模块依赖
- mdfjs 里的模块要设置成 private
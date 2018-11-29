var wilddog = require('wilddog-weapp-all')
var config = require('config')
//app.js
App({
  onLaunch: function () {
    // console.log('app onLaunch')
    var that = this
    wilddog.initializeApp(config.wilddog)
  },
  getUserInfo:function(cb, user) {
    var that = this
    wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      })
    if(this.globalData.user){
      typeof cb == "function" && cb(this.globalData.user)
    }else{
      // 野狗登录
      wilddog.auth().signInWeapp().then(function(user){
        that.globalData.user = user
        console.log(user)
        if (!!user) {
          typeof cb == "function" && cb(that.globalData.user)
          // 野狗登录接口中的头像数据是老的数据，只能再调一次
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              wilddog.sync().ref('/user').child(that.globalData.user.uid).set(res.userInfo)
            },
            fail: function (err) {
              console.log("getUserInfo-error",err);
            }
          })
        }
        else
          typeof cb == "function" && cb(null)
      }).catch(function(err){
      //可能是拒绝授权
        typeof cb == "function" && cb(-1)
        // console.log(err);
      })
    }
  },
  addItem:function(text){
    this.ref.push(text)
  },
  //获取根节点
  getRootRef:function(){
    return wilddog.sync().ref('/');
  },
  //获取当前用户项目节点
  getCurrentUserProRef:function(){
    if (this.globalData.user.uid)
      return wilddog.sync().ref('/user_pro').child(this.globalData.user.uid);
    else
      return null;

  },
  //获取账本节点
  getProRef:function() {
    return wilddog.sync().ref('/pro');
  },
  //获取记录节点
  getNoteRef:function() {
    return wilddog.sync().ref('/note');
  },
  globalData:{
    userInfo:null,
    user:null
  }
})
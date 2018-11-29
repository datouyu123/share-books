var util = require('../../utils/util.js')
var app = getApp()
Page({
    data: {
    name:null,
    todos:[]
  },
  bindNameInput:function(e){
    this.data.name = e.detail.value
  },
  getUserInfo: function () {
    // 野狗中的头像数据是老的数据，出不来只能再调一次
    wx.getUserInfo({      
      success: function (res) {
        that.globalData.userInfo = res.userInfo
        typeof cb == "function" && cb(that.globalData.userInfo)
        //console.log("getUserInfo",that.globalData.userInfo)
        wilddog.sync().ref('/user').child(that.globalData.user.uid).set(res.userInfo)
      },
      fail: function (err) {
        typeof cb == "function" && cb(null)
        // console.log("getUserInfo-error",err);
      }
    })
  },
  addItem: function(){
    var that = this
    // console.log(this.data);
    if(this.data.name!=null){
      if(this.currentUserProRef && this.proRef){
        var newDate = util.formatDate(new Date())
         var value = {"name" : that.data.name,"time":newDate}
        this.currentUserProRef.push(value)
            .then(function(newRef){ 
            //  console.info("newRef:",newRef.key());
             var key = newRef.key()
             var proValue = {
              "name": app.globalData.userInfo.nickName, "avatarUrl": app.globalData.userInfo.avatarUrl
,
              "payAmount":'0.00'
             }
             //增加项目名称、时间到pro节点
             that.proRef.child(key).set(                                {"name":that.data.name,
                 "time":newDate})
             .then(function(){
             })
             //增加note节点
             that.noteRef.child(key).set(                                {"payTotal":'0.00'})
             .then(function(){
             })
             //增加用户信息到pro节点
             that.proRef.child(key).child('users').child(app.globalData.user.uid).set(proValue)
             .then(function(){ 
               try {
                    wx.setStorageSync('indexChange', true)
                    wx.redirectTo({
                 url: '../project-detail/project-detail?'                  +'&proName='+value.name+'&proKey='+key
               })
                } catch (e) {    
                }
             })
               .catch(function(err){
                  // console.info('set data failed', err.code, err);
         })            
    })
            .catch(function(err){
                // console.info('add proItem failed',                       err.code, err);
            });
      }
    }
    else if(this.data.name==null){
      wx.showModal({
         title: '提示',
         content: '请输入项目名称',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
            }
          }
       })
      }
  },
    onLoad: function () {
      // console.log('add-project onLoad')
      this.currentUserProRef = app.getCurrentUserProRef()
      this.proRef = app.getProRef()
      this.noteRef = app.getNoteRef()
    }
})
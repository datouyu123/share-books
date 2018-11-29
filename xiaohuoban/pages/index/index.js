//index.js
//获取应用实例
var wilddog = require('../../wilddog-weapp-all')
var app = getApp()
Page({
  data: {
    motto: '',
    motto_l:'',
    userInfo: {   //用户信息
    },
    pros:[],      //账本数组
    pros_length: 1,//账本数量
    prompt: '人生没有彩排，每天都是现场直播。',
    flag: false, // 首页账本数据是否加载好
    authFlag: 0, // 是否授权flag 0 未判断 1 已授权 2 未授权
    canIUse: wx.canIUse('button.open-type.getUserInfo') //是否能用getUserInfo，不能用就让用户授权
  },
  //删除按钮
  deleteItem:function(e){
    var that = this
    wx.showModal({
         title: '提示',
         content: '确定删除账本吗？',
         showCancel:true,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
              var key = e.target.dataset.key
              that.currentUserProRef = app.getCurrentUserProRef()
              that.currentUserProRef.child(key).remove()
              wx.redirectTo({
                url: '../index/index'
              })
            }
          }
       })
  },

  //添加账本操作
  addPro: function() {
    //最多添加20个账本
    if(this.data.pros_length==20){
         wx.showModal({
         title: '提示',
         content: '您已添加20个账本，请删除后添加',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
            }
          }
       })
    }
    else{
      wx.navigateTo({
      url: '../add-project/add-project'
    })
    }
  },
  navigateToPro: function(index){
    // console.log("e",index.target.dataset);

    if(index.target.dataset.key){
      wx.navigateTo({
        url: '../project-detail/project-detail?'+'&proName='+index.target.dataset.name+'&proKey='+index.target.dataset.key+'&share='+false
      })
    }
   
  },
  // 彩蛋
  egg: function(){
    wx.showToast({
      title: '自强不息，止于至善',
      icon: 'success',
      duration: 1000
})
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    this.getUserInfo(true)
   
  },
  // 全屏预览赞赏码
  previewImage: function () {
    wx.previewImage({
      current:                                                'https://alicdn.celier-china.com/uploads/yao_qr_code.png', // 当前显示图片的https链接   
      urls: ['https://alicdn.celier-china.com/uploads/yao_qr_code.png'] // 需要预览的图片https链接列表   
    })
  },
  // 点击授权登录
  bindGetUserInfo(e) {
    this.getUserInfo()
  },
  // 获取用户信息
  getUserInfo(pullDown) {
    // 查看是否授权
    var that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权
            that.setData({
              autoFlag: 1
            })
            app.getUserInfo(function (userInfo) {
              if (userInfo == -1) {
                that.setData({
                  prompt: '没有请求到数据，网络问题请下拉刷新。或移除小程序后重新进入。'
                })
                wx.hideToast()
                if (pullDown) {
                  wx.stopPullDownRefresh()
                }
              } else {
                //更新数据
                that.setData({
                  userInfo: userInfo
                })
                // 如果有授权更新
                if (app.globalData.user.uid) {
                  that.currentUserProRef = app.getCurrentUserProRef()
                  that.currentUserProRef.limitToFirst(20).once('value', function (snapshot, prKey) {
                      that.setData({
                        pros: [],
                        pros_length: 1
                      })
                      var prosValue = snapshot.val();
                      //倒序显示账本
                      for (var prokey in prosValue) {
                        var key = prokey;
                        var text = prosValue[key];
                        var newItem = {
                          key: key,
                          text: text
                        }
                        that.data.pros.unshift(newItem)
                      }
                      //that.data.pros.reverse();
                      that.setData({
                        pros: that.data.pros,
                        pros_length: that.data.pros.length,
                        flag: true
                      })
                      // console.log("data",that.data)
                      wx.hideToast()
                      if (pullDown) {
                        wx.stopPullDownRefresh()
                      }
                    }, this)
                    .catch(function (err) {
                      wx.hideToast()
                      if (pullDown) {
                        wx.stopPullDownRefresh()
                      }
                      console.info(err);
                    });
                } else {
                  wx.hideToast()
                  if (pullDown) {
                    wx.stopPullDownRefresh()
                  }
                }
              }
            })
            // // 野狗登录接口中的头像数据是老的数据，只能再调一次
            // wx.getUserInfo({
            //   success: function (res) {
            //     app.globalData.userInfo = res.userInfo
            //     console.log("getUserInfo", app.globalData.userInfo)
            //     wilddog.sync().ref('/user').child(app.globalData.user.uid).set(res.userInfo)
            //   },
            //   fail: function (err) {
            //     console.log("getUserInfo-error",err);
            //   }
            // })
        } else {
          that.setData({
            autoFlag: 2,
            prompt: '授权后，才能分享和加入记账哦！'
          })
          if (pullDown) {
            wx.stopPullDownRefresh()
          }
        }
      },fail (err) {
        console.log(err)
        if (pullDown) {
          wx.stopPullDownRefresh()
        }
      }
    })
  },
  onLoad: function () {
    this.getUserInfo()
    

  },
  onShow: function() {
      var that = this
       //调用应用实例的方法获取全局数据
    try {
      //是否新添了账本，新添则刷新
      var value = wx.getStorageSync('indexChange')
    if (value) {
      this.getUserInfo()
      try {
        wx.removeStorageSync('indexChange')
      } catch (e) {
        // Do something when catch error
      }
    }
  } catch (e) {
    // Do something when catch error
  }
  },
  onHide: function() {
    // Do something when page hide.
    var that = this 
  }
})

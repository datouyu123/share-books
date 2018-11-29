// pages/project-detail/project-detail.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data:{
    info:{},
    userInfo:{},
    pro:{}, //当前账本
    pros:[],//当前用户所有账本
    users:[],
    usersShow:[],//多于5个只显示5个
    note:{},
    allNote:[],
    payTotal:'0.00',
    pros_length:1,
    isInProFlag:true, //判断我要加入按钮是否显示
    isReadyToChargeFlag:true, //判断记一笔按钮是否显示
    average:'' //人均消费
  },
  //我要加入
  addInPro: function(){
    var that = this
    if(this.data.pros_length==20){
         wx.showModal({
         title: '提示',
         content: '您已添加20个账本，请删除后添加',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
               console.log('用户点击确定')
            }
          }
       })
    }
    else{
          var proValue =                                           {"name":that.data.userInfo.nickName,             "avatarUrl":that.data.userInfo.avatarUrl,
          "payAmount":'0.00'}
    //push到pro节点
    if(that.proRef && that.currentUserProRef){
          that.proRef.child(that.data.info.proKey).child('users').child(app.globalData.user.uid).set(proValue)
 .then(function(){ 
   //push到user_pro节点
     var key = that.data.info.proKey
     console.log("keyy",key);
     if(key){
       var newDate = util.formatDate(new Date())
       var value = {"name" : that.data.info.proName,"time":newDate}
      that.currentUserProRef.child(that.data.info.proKey).set(value)
      .then(function(){ 
          wx.redirectTo({
      url: '../project-detail/project-detail?'                  +'&proName='+that.data.info.proName+'&proKey='+that.data.info.proKey
      })
      })
      .catch(function(err){
               console.info('add proItem failed in detail',                       err.code, err);
        });
     }
   })
  .catch(function(err){
    console.info('set data failed', err.code, err);
   })
    }
    }
  },
  //记一笔
  addaNote: function(){
    var that = this
    try {
      wx.removeStorageSync('choose-user')
      wx.navigateTo({
      url: '../add-note/add-note?'+'&proKey='+that.data.info.proKey
    })
    } catch (e) {
  // Do something when catch error
    }
  },
  //账单详情
  peopleDetail: function () {
    var that = this
     wx.navigateTo({
      url: '../payment-detail/payment-detail?'+'&proKey='+that.data.info.proKey+'&share='+false,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  //分享账本
  onShareAppMessage: function () {
    var that = this
  
    return {
      title: '小伙伴'+that.data.userInfo.nickName+'邀请您记账',
        path: '/pages/project-detail/project-detail?'                  +'&proName='+that.data.info.proName+'&proKey='+that.data.info.proKey+'&share='+true
      }
  },
  //note编辑
  noteEdit: function (index) {
    console.log("e",index.target.dataset);
    var that = this
    var thisNote
    for(var n in that.data.allNote){
      console.log(that.data.allNote[n].key)
      if(that.data.allNote[n].key == index.target.dataset.key){
      thisNote = that.data.allNote[n].text;
      break;
      }
    }

    try {
          wx.removeStorageSync('note')
          wx.setStorageSync('note', thisNote)
                wx.navigateTo({
      url: '../edit-note/edit-note?'+'&proKey='+that.data.info.proKey+'&noteKey='+index.target.dataset.key,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
      } catch (e) {    
      }
  },
  showPeopleDetail:function(){
      wx.navigateTo({
      url: '../users-list/users-list'
    })
  },
  // load数据的核心方法（在loadData中调用）
  load: function (pullDown) {
    var that = this
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    that.currentUserProRef = app.getCurrentUserProRef()
    var key = that.data.info.proKey
    if (key) {
      //获取pro
      that.setData({
        pro: {},
        users: [],
        usersShow: []
      })
      that.proRef.child(key).once('value', function (snapshot, prKey) {

        var key = snapshot.key()
        var text = snapshot.val();
        var newItem = {
          key: key,
          text: text
        }
        that.setData({
          pro: newItem
        })
        var usersValue = that.data.pro.text.users
        for (var userkey in usersValue) {
          var ukey = userkey;
          var utext = usersValue[ukey];
          var uItem = {
            key: ukey,
            text: utext
          }
          that.data.users.push(uItem)
        }
        that.setData({
          users: that.data.users
        })
        for (var i = 0; i < 5; i++) {
          that.data.usersShow.push(that.data.users[i])
        }
        that.setData({
          usersShow: that.data.usersShow
        })

        try {
          wx.setStorageSync('users', that.data.users)
        } catch (e) {}
        // 判断登录用户是否在账单中
        var userKey = app.globalData.user.uid
        var index = that.data.users.findIndex(function (item, index) {
          console.log("itemkey", item.key);
          if (item.key == userKey) {
            return true
          }
          return false
        })
        if (index >= 0) {
          that.setData({
            isInProFlag: true,
            isReadyToChargeFlag: false
          })
          //获取note
          that.setData({
            note: {},
            allNote: [],
            payTotal: '0.00'
          })
          that.noteRef.child(key).once('value', function (snapshot, prKey) {
            var key = snapshot.key()
            var text = snapshot.val();
            var newItem = {
              key: key,
              text: text
            }
            that.setData({
              note: newItem
            })
            var notesValue = that.data.note.text.notes
            for (var notekey in notesValue) {
              var nkey = notekey;
              var ntext = notesValue[nkey];
              var nItem = {
                key: nkey,
                text: ntext
              }
              that.data.allNote.push(nItem)
            }
            that.data.allNote.reverse();
            that.setData({
              allNote: that.data.allNote
            })
            console.log("data.notes", that.data.allNote);
            //计算总额
            if (that.data.allNote.length > 0) {
              var paytota = '0.00';
              for (var n in that.data.allNote) {
                var a = that.data.allNote[n]
                paytota = (paytota * 100 + a.text.amount * 100) / 100
              }
              var paytotas = paytota.toFixed(2)
              that.setData({
                payTotal: paytotas
              })
            }
            //人均消费
            var a = that.data.payTotal * 100 / (that.data.users.length) / 100
            var aver = a.toFixed(2)
            that.setData({
              average: aver
            })
            try {
              wx.setStorageSync('average', that.data.average)
            } catch (e) {}
            wx.hideToast();
            if (pullDown) {
              wx.stopPullDownRefresh()
            }
          }, this)
        } else {
          that.setData({
            isInProFlag: false,
            isReadyToChargeFlag: true
          })
          that.currentUserProRef.limitToFirst(20).once('value', function (snapshot, prKey) {
            var prosValue = snapshot.val();
            for (var prokey in prosValue) {
              var key = prokey;
              var text = prosValue[key];
              var newItem = {
                key: key,
                text: text
              }
              that.data.pros.push(newItem)
            }
            var length = that.data.pros.length
            that.setData({
              pros: that.data.pros,
              pros_length: length,
            })
            wx.hideToast();
            if (pullDown) {
              wx.stopPullDownRefresh()
            }
            console.log("data", that.data)
          }, this)
        }

      }, this)

    }
  },
  // 初始化load数据
  loadData: function (pullDown) {
    var that = this
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo
      })
      that.load(pullDown)
    } else {
      // 查看是否授权
      wx.getSetting({
        success (res){
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: function(res) {
                //更新数据
                that.setData({
                  userInfo:res.userInfo
                })
                that.load(pullDown)
              }
            })
          }
        }
      })
    }
  },
  onPullDownRefresh: function(){
    this.loadData(true)
  },
  onLoad:function(options){
    var that = this
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          that.setData({
            info: options
          })
          that.proRef = app.getProRef()
          that.noteRef = app.getNoteRef()

          that.loadData()
        } else {
          // 没有授权，跳转index页面授权
          wx.redirectTo({
            url: '../index/index',
            success: function (res) {
              // success
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete
            }
          })
        }
      }, fail (err) {}
    })
    // 页面初始化 options为页面跳转所带来的参数
    //更新数据
  },
  onShow: function() {
    // Do something when page show.
    var that = this
    try {
        var value = wx.getStorageSync('detailChange')
        if (value) {
            // Do something with return value
                //调用应用实例的方法获取全局数据
        that.loadData()
    try {
      wx.removeStorageSync('detailChange')
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
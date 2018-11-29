var util = require('../../utils/util.js')
var app = getApp()
Page({
  data:{
    proKey:'',
    noteKey:'',
    note:{
    },
    noteForward:{}, 
    itemList: ['吃喝', '交通', '购物', '娱乐', '房租', '其他']
  },
  bindAmountInput: function(e) {
    this.setData({
      'note.amount': e.detail.value
    })
  },
  bindType: function(e) {
    var that = this
    wx.showActionSheet({
      itemList: ['吃喝', '交通', '购物', '娱乐', '房租', '其他'],
  success: function(res) {
    //console.log(res.tapIndex)
    // console.log('res',res)
    if(!res.cancel){
      that.setData({
      'note.typed':that.data.itemList[res.tapIndex],
      placeType:''
    })
    }
  },
  fail: function(res) {
    console.log(res.errMsg)
  }
})
  },
  bindUsers: function(e) {
    wx.navigateTo({
      url: '../choose-users/choose-users',
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
  bindDateChange: function(e) {
    this.setData({
      'note.date': e.detail.value
    })
  },
  bindRemarkInput: function(e) {
    this.setData({
      'note.remark': e.detail.value
    })
  },
    //删除条目
  deleteNote: function(e){
    var that = this;
    wx.showModal({
         title: '提示',
         content: '确定删除条目吗？',
         showCancel:true,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
               try {
          var value = wx.getStorageSync('note')
          if (value) {
          // Do something with return value
          that.setData({
              noteForward:value,
          })
          // console.log('editnote show data:',that.data);
        }
    } catch (e) {
  // Do something when catch error
    }
               //总额减少
               that.noteRef.child(that.data.proKey).child('payTotal').transaction(function(currentData) {
          if (currentData == null) {
             return 0;
    } 
    // console.log('paytotal',currentData);
    var ss = (currentData*100-that.data.noteForward.amount*100)/100
    var s = ss.toFixed(2)
    // console.log('s',s);
    return s;
            
          }).then(function(result) {
                 wx.hideToast()
            // console.log('result',result.snapshot.val())
            if (!result.committed) {
              //  console.log('transaction commit failed ,wilma has been exist.');
            } else {
              //  console.log('transaction commit success!');
               //delete note记录到note表
              that.noteRef.child(that.data.proKey).child('notes').child(that.data.noteKey).remove()   
            //修改付款人支出数额         
           that.proRef.child(that.data.proKey).child('users').child(that.data.noteForward.payer.key).child('payAmount').transaction(function(currentData) {
            if (currentData == null) {
             return 0;
              } 
            //  console.log('payAmount',currentData);
              var ss = (currentData*100-that.data.noteForward.amount*100)/100
                var s = ss.toFixed(2)
                // console.log('s',s);
                return s;
             })
             try {
                wx.setStorageSync('detailChange', true)
              wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
              }
            })
            }
          }
       })
  },
  commitaNote: function(){
    var that = this
    if(this.data.note.amount==null || this.data.note.amount==''){
      wx.showModal({
         title: '提示',
         content: '请输入金额',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
            }
          }
       })
      }
      else if(this.data.note.typed==null || this.data.note.typed==''){
      wx.showModal({
         title: '提示',
         content: '请选择类别',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
            }
          }
       })
      }
      else if(this.data.note.payer.text==null){
      wx.showModal({
         title: '提示',
         content: '请选择付款人',
         showCancel:false,
          success: function(res) {
            if (res.confirm) {
              //  console.log('用户点击确定')
            }
          }
       })
      }
      else{
        try {
          wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
            })
          //保留小数点后两位
          var num = new Number(that.data.note.amount);
          var aNew = num.toFixed(2);
          // console.log('change:',aNew);
          if(aNew != 'NaN' && aNew != null){
                      that.setData({
            'note.amount':aNew
          })
          // console.log('data',that.data);
          var last = app.globalData.userInfo.nickName
          if(last){
            that.setData({
            'note.lastModify':last
          })
          }
        try {
          var value = wx.getStorageSync('note')
          if (value) {
          // Do something with return value
          that.setData({
              noteForward:value,
          })
          // console.log('editnote show data:',that.data);
        }
    } catch (e) {
  // Do something when catch error
    }
          //累加总额
          that.noteRef.child(that.data.proKey).child('payTotal').transaction(function(currentData) {
          if (currentData == null) {
             return 0;
    } 
    // console.log('paytotal',currentData);
    var ss = (currentData*100-that.data.noteForward.amount*100+that.data.note.amount*100)/100
    var s = ss.toFixed(2)
    // console.log('s',s);
    return s;
            
          }).then(function(result) {
            wx.hideToast()
            // console.log('result',result.snapshot.val())
            if (!result.committed) {
              //  console.log('transaction commit failed ,wilma has been exist.');
            } else {
              //  console.log('transaction commit success!');
               //添加note记录到note表
              that.noteRef.child(that.data.proKey).child('notes').child(that.data.noteKey).set(that.data.note)          
           .then(function(newRef){
             //修改付款人支出数额
             if(that.data.note.payer.key == that.data.noteForward.payer.key){
                            that.proRef.child(that.data.proKey).child('users').child(that.data.noteForward.payer.key).child('payAmount').transaction(function(currentData) {
            if (currentData == null) {
             return 0;
              } 
            //  console.log('payAmount',currentData);
              var ss = (currentData*100-that.data.noteForward.amount*100+that.data.note.amount*100)/100
                var s = ss.toFixed(2)
                // console.log('s',s);
                return s;
             })
             try {
                wx.setStorageSync('detailChange', true)
              wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
             }
             else{
                that.proRef.child(that.data.proKey).child('users').child(that.data.noteForward.payer.key).child('payAmount').transaction(function(currentData) {
            if (currentData == null) {
             return 0;
              } 
            //  console.log('payAmount',currentData);
              var ss = (currentData*100-that.data.noteForward.amount*100)/100
                var s = ss.toFixed(2)
                // console.log('s',s);
                return s;
             })
             that.proRef.child(that.data.proKey).child('users').child(that.data.note.payer.key).child('payAmount').transaction(function(currentData) {
            if (currentData == null) {
             return 0;
              } 
            //  console.log('payAmount',currentData);
              var ss = (currentData*100       +that.data.note.amount*100)/100
                var s = ss.toFixed(2)
                // console.log('s',s);
                return s;
             })
             try {
                wx.setStorageSync('detailChange', true)
              wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
             }

           })
           .catch(function(err){
              console.info('add proItem failed',                       err.code, err);
            });
            }
          })
          }
          else{
            wx.hideToast()
            
            wx.showModal({
          title: '提示',
          content: '请按正确格式输入金额',
          showCancel:false,
            success: function(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              }
            }
       })
          }
        } catch (e) {    
        }
      }
  },

   onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    // console.log('edit-note onLoad')
    try {
      wx.removeStorageSync('choose-user')
    } catch (e) {
      // Do something when catch error
    }
    that.setData({
        proKey:options.proKey,
        noteKey:options.noteKey
      })
    that.proRef = app.getProRef()
    that.noteRef = app.getNoteRef()
    var newDate = util.formatDate(new Date())
    try {
        var value = wx.getStorageSync('note')
        if (value) {
        // Do something with return value
        that.setData({
            note:value
        })
        // console.log('editnote show data:',that.data);
        }
    } catch (e) {
  // Do something when catch error
    }

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    var that = this
    // 页面显示
try {
      var value = wx.getStorageSync('choose-user')
    if (value) {
      // Do something with return value
      // console.log('choose-user：:',value)
      that.setData({
        'note.payer':value
      })
    }
    } catch (e) {
  // Do something when catch error
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
var app = getApp()
Page({
  data:{
      users:[]
  },    
  backToAdd: function(index){
      var that = this
      var dataKey = index.target.dataset.key
      if(dataKey){
          for(var i=0; i<that.data.users.length;i++){
              if(that.data.users[i].key == dataKey){
                  try {
                    var user = {key:that.data.users[i].key,text:{avatarUrl:that.data.users[i].text.avatarUrl,name:that.data.users[i].text.name}}
                    wx.setStorageSync('choose-user', user)
                    break;
                  } catch (e) {    
                    }
              }
          }
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
      }
  },
  onLoad: function () {
      var that = this
      try {
  var value = wx.getStorageSync('users')
  if (value) {
      // Do something with return value
      // console.log('user choose:',value);
      that.setData({
          users:value
      })
  }
} catch (e) {
  // Do something when catch error
}
      
    }
})
var app = getApp()
Page({
  data:{
      users:[]
  },    
  onLoad: function () {
      var that = this
      try {
  var value = wx.getStorageSync('users')
  if (value) {
      // Do something with return value
      console.log('user choose:',value);
      that.setData({
          users:value
      })
  }
} catch (e) {
  // Do something when catch error
}
      
    }
})
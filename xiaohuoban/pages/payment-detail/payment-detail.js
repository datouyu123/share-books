var app = getApp()
Page({
  data:{
      proKey:'',
      share:'',
      pro:{},
      users:[],
      note:{},
      allNote:[],
      payTotal:'0.00',
      average:''
  },   
  onShareAppMessage: function () {
    var that = this

    return {
        title: '小伙伴记账',
        desc: '账单详情',
        path: 'pages/payment-detail/payment-detail?'+'&proKey='+that.data.proKey+'&share='+true
      }
  },
  onLoad: function (options) {
      var that = this
      console.log("options",options)
      that.setData({
        proKey:options.proKey,
        share:options.share
      })
      that.proRef = app.getProRef()
      that.noteRef = app.getNoteRef()
    that.setData({
        pro:{},
        users:[],
        average:''
      })
    that.proRef.child(that.data.proKey).once('value',function(snapshot,prKey){
      
      var key = snapshot.key()
      var text = snapshot.val();
      var newItem = {key:key,text:text}
      that.setData({
        pro:newItem
      })
      var usersValue = that.data.pro.text.users
      for(var userkey in usersValue){
        var ukey = userkey;
        var utext = usersValue[ukey];
        var uItem = {key:ukey,text:utext}
        that.data.users.push(uItem)
      }
      that.setData({
        users:that.data.users
      })
     //获取average
    that.setData({
        note:{},
        allNote:[],
        payTotal:'0.00'
      })
       that.noteRef.child(that.data.proKey).once('value',function(snapshot,prKey){
         var key = snapshot.key()
         var text = snapshot.val();
         var newItem = {key:key,text:text}
          that.setData({
            note:newItem
        })
        var notesValue = that.data.note.text.notes
      for(var notekey in notesValue){
        var nkey = notekey;
        var ntext = notesValue[nkey];
        var nItem = {key:nkey,text:ntext}
        that.data.allNote.push(nItem)
      }
      that.data.allNote.reverse();
      that.setData({
        allNote:that.data.allNote
      })
      console.log("data.notes",that.data.allNote);
      //计算总额
      if(that.data.allNote.length>0){
        var paytota = '0.00';
        for(var n in that.data.allNote){
        var a = that.data.allNote[n]
         paytota = (paytota*100+a.text.amount*100)/100
      }
      var paytotas = paytota.toFixed(2)
      that.setData({
        payTotal:paytotas
      })
      }
      //人均消费
      var a = that.data.payTotal*100/(that.data.users.length)/100
      var aver = a.toFixed(2)
     if (aver) {
            // Do something with return value
            console.log('average:',aver);
            that.setData({
                average:aver
            })
            //计算还应支付或收入
            var users = that.data.users
            for(var u in users){
                var utext = users[u]
                var amount = ((utext.text.payAmount*100-that.data.average*100)/100)
                if(amount>=0){
                    that.data.users[u].isPay = true
                    that.data.users[u].retain = (amount.toFixed(2))
                }
                else{
                    that.data.users[u].isPay = false
                    that.data.users[u].retain = ((-amount).toFixed(2))
                }
                  
            }
            that.setData({
                users:that.data.users
                })  
            console.log('users:',that.data.users);
        }
       },this) 

    },this);
      
  }
})
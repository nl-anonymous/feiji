let data = {

  // 商院航拍图
  sky: {
    w: $('#sky')[0].offsetWidth, // 宽
    h: $('#sky')[0].offsetHeight, // 高
  },

  // Fighter aircraft
  // 战斗机
  f:{    
    x: 50, // 横坐标
    y: 50, // 纵坐标
    w: $('#f')[0].offsetWidth, // 宽
    h: $('#f')[0].offsetHeight, // 高
    bullets: [], // 所有的子弹
    bullets_amount: 0, // 子弹总数
    fire_sound: '../assets/sound/bullet_livon_0.13.mp3' // 开火音效
  },  
  
  // 定时器
  timers: [],  
  
  // logo
  clouds: [],
  
  // 日机
  virus: {
    arr: [], // 全体
    num: 0, // 编号，用于移除
    amount: 0, // 总数
    hited: 0, // 被击落数量
    hited_percent: 0, // 击落率
    hited_sound: '../assets/sound/爆炸.m4a'
  },

  // 成功
  success: false,
  success_sound: '../assets/sound/success.mp3' // 音效

}

var app = new Vue({
  el: '#app',  
  data: data ,

  methods: {

    // 移动端拖动（目前还有定位问题）
    touchmove(){

      let touch
      if(event.touches){
          touch = event.touches[0]
      }else {
          touch = event
      }

      this.f.x = touch.clientX - this.f.w / 2
      this.f.y = touch.clientY - this.f.h - 20
    },   // 射击
    bullet_fire(){
      this.f.bullets.push({
        x: this.f.x + 13 , // 在机头发射
        y: this.f.y - 10 ,
      })

      this.f.bullets_amount ++ // 子弹计数
      new Audio( this.f.fire_sound ).play() // 开火音效
    },

    // 子弹飞
    bullet_move(){
      for( let i = 0; i < this.f.bullets.length; i ++ ){
        let b = this.f.bullets[i]
        b.y -= 3 // 向上移动 3 

        // 击中检测
        this.hit_check( b )

        // 越界移除
        if( b.y < 5 ){
          this.f.bullets.splice(i,1)
        }
      }
    },   

    init(){

      this.success = false
    
      // 兔子 - 子弹
      this.timers.push( setInterval( this.bullet_fire, 400 ))
      this.timers.push( setInterval( this.bullet_move, 10 ))
      
      // 商院logo
      this.timers.push( setInterval( this.cloud_lunch, 2000 ))
      this.timers.push( setInterval( this.cloud_move, 500 ))

      // 日本飞机 - 敌机
      this.timers.push( setInterval( this.virus_lunch, 100 ))
      this.timers.push( setInterval( this.virus_move, 100 ))

    },

    // logo出现
    cloud_lunch(){
      let ok = Math.ceil( Math.random() * 100 )
          // 一半的概率
      if( ok > 90 ){
        let x = Math.ceil( Math.random() * (this.sky.w - 260) )
        this.clouds.push( { x: x, y: 5 } )
      }
    },
        // 白云移动
    cloud_move(){
      for( let i = 0; i < this.clouds.length; i ++ ){
        let c = this.clouds[i]
        c.y += 20
            // 超界移除
        if( c.y > this.sky.h - 160 ){
          this.clouds.splice(i,1)
        }
      }
    },

    // 日机出现
    virus_lunch(){
      let ok = Math.ceil( Math.random() * 100 )
    
      // 90% 的概率
      if( ok > 90 ){
        let x = Math.ceil( Math.random() * ( this.sky.w - 80 ) )
        this.virus.arr.push( { x: x, y: 5, num: ++ this.virus.num } )
        this.virus.amount ++
      }
    },
    
    // 日机袭来
    virus_move(){
      for( let i = 0; i < this.virus.arr.length; i ++ ){
        let e = this.virus.arr[i]
        e.y += 10
    
        // 越界移除
        if( e.y > this.sky.h - 55 ){
          this.virus.arr.splice(i,1)
        }
      }
    }, 

    
    // 击中检测
    hit_check( b ){

      // 遍历日机
      for( let i = 0; i < this.virus.arr.length; i ++ ){

        let e = this.virus.arr[i]
        let d = getDistanceBetweenTwoPoints( b.x, b.y, e.x, e.y )

        // 击中 - 距离过近
        if( d < 35 ){

          // 击中，移除
          this.virus.arr.splice( this.virus.arr.findIndex(item => item.num === e.num), 1)

          // 击落次数
          this.virus.hited ++

          // 击落百分比
          if( this.virus.amount ){
            let p = this.virus.hited / this.virus.amount
            this.virus.hited_percent = Math.round( p * 100 )
          }
          
          // 击中音效
          new Audio( this.virus.hited_sound ).play() 
        }
      }
    },


  },

  mounted: function() {
    
    // 初始化
    this.init()
  },

  watch: {

    // 击落次数
    'virus.hited' : function( val ){
      if( val % 50 === 0 ){
        this.success = true
      }
    },
        // 成功，飞机、子弹、日机都暂停
    'success' : function( val ){
      if( val ){
        new Audio( this.success_sound ).play() // 成功音效
        
        // 暂停定时器
        this.timers.forEach(element => {
          clearInterval( element )
        });
      }
    },
  },

})


// 计算平面中两点之间的距离
// 返回距离
function getDistanceBetweenTwoPoints( x1, y1, x2, y2 ){
  let a = x1 - x2
  let b = y1 - y2
  let result = Math.sqrt( Math.pow( a, 2) + Math.pow( b, 2 ) )
  return Math.round( result )
}
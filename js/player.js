(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor: Player,
        musicList: [],
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1, // 4  3
        //播放音乐方法
        playMusic: function (index, music) {
            // 判断是否是同一首音乐
            if(this.currentIndex == index){
                // 同一首音乐
                if(this.audio.paused){
                    this.audio.play();
                }else{
                    this.audio.pause();
                }
            }else {
                // 不是同一首
                this.$audio.attr("src", music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        preIndex: function () {
            var index = this.currentIndex - 1;
            if(index < 0){
                index = this.musicList.length - 1;
            }
            return index;
        },
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if(index > this.musicList.length - 1){
                index = 0;
            }
            return index;
        } ,
        changeMusic: function (index) {
            // 删除对应的数据
            this.musicList.splice(index, 1);

            // 判断当前删除的是否是正在播放音乐的前面的音乐
            if(index < this.currentIndex){
                this.currentIndex = this.currentIndex - 1;
            }
        },
        //获取音乐播放的进度
        getMusicDuration:function(){
            return this.audio.duration;//js中audio原生方法
            //返回的时音频的总时间(秒)
        },
        getMuiscCurrentTime:function(){
            return this.audio.currentTime;//js中audio原生方法
            //每隔0.几秒就会执行一次
        },
        musicSeekTo:function(value){
            this.audio.currentTime = this.audio.duration * value;
        },
        musicVoiceSeekTo:function(value){
            //audio.volume的值可以为0~1之间
            this.audio.volume = value;
        }
        
    } 
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);
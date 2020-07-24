$(function () {

  let $audio = $("audio");
  let player = new Player($audio);
  let lyric;
  let $progressBar = $('.music_progress_bar');
  let $progressLine = $('.music_progress_line');
  let $progressDot = $('.music_progress_dot');
  let progress = new Progress($progressBar, $progressLine, $progressDot);
  //进度条点击
  progress.progressClick(function (value) {
    player.musicSeekTo(value);
  });
  //进度条拖拽
  progress.progressMove(function (value) {
    player.musicSeekTo(value);
  });

  //获取歌曲信息
  //1.加载歌曲列表
  function getPlayList() {
    $.ajax({
      url: './source/musiclist.json',
      dataType: 'json',
      success: function (data) {
        player.musicList = data;
        //3.1遍历获取到的数据，创建每一条音乐
        $.each(data, function (index, music) {
          let $item = crateMusicaItem(index, music);
          $(".musicList").append($item);
        })
        //初始化歌曲信息
        initMusicInfo(data[0]);
        //初始化歌词信息
        initMusicLyric(data[0]);
      },
      error: function (e) {
        console.log(e);
      }
    })
  }
  getPlayList();

  //2.监听事件
  initEvent()
  function initEvent() {
    //1.监听歌曲的移入移出事件
    $(".content_list").delegate(".list_music", "mouseenter", function () {
      $(this).find(".list_menu").stop().fadeIn(0);
      $(this).find(".list_time a").stop().fadeIn(0);
      $(this).find(".list_time span").stop().fadeOut(0)
    });
    $(".content_list").delegate(".list_music", "mouseleave", function () {
      $(this).find(".list_menu").stop().fadeOut(0);
      $(this).find(".list_time a").stop().fadeOut(0);
      $(this).find(".list_time span").stop().fadeIn(0)
    });

    //2.监听复选框内容
    $(".content_list").delegate(".list_check", "click", function () {
      $(this).find(".check").toggleClass("list_checked");
      $(this).find(".check").toggleClass("check2");
    })
    //3.添加子菜单播放按钮的监听
    let $musicPlay = $(".music_play");
    $(".content_list").delegate(".list_menu_play", "click", function () {
      let $item = $(this).parents(".list_music");
      //切换播放图标
      $(this).toggleClass("list_menu_play2");
      //复原其他播放图标
      $(this).parents(".list_music").siblings().find(".list_menu_play").removeClass("list_menu_play2")
      //同步底部播放按钮
      if ($(this).attr("class").indexOf("list_menu_play2") != -1) {
        //是播放状态
        $musicPlay.addClass("music_play2");

        //文字高亮
        $(this).parents(".list_music").find('div').css('color', '#fff');
        $(this).parents(".list_music").siblings().find("div").css('color', 'rgba(255,255,255,.5)');
        //index变成动画,隐藏数字
        $(this).parents(".list_music").find('.list_number').addClass("list_number2");
        $(this).parents(".list_music").siblings().find(".list_number").removeClass("list_number2");
      } else {
        //不是播放状态
        $musicPlay.removeClass("music_play2");
        $(this).parents(".list_music").find('div').css('color', 'rgba(255,255,255,.5)');
        //index变成number
        $(this).parents(".list_music").find('.list_number').removeClass("list_number2");
      }
      //播放音乐
      player.playMusic($item.get(0).index, $item.get(0).music);
      //重新将信息修改歌曲信息
      initMusicInfo($item.get(0).music);
      //修改歌词信息
      initMusicLyric($item.get(0).music);
    })

    //4.监听底部控制区域播放暂停
    $(".music_play").click(function () {
      //判断之前有没有播放
      if (player.currentIndex == -1) {
        //没有播放
        $(".list_music").eq(0).find(".list_menu_play").trigger("click");
      } else {
        //已经播放过
        $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
      }
    });
    //5.上一首
    $('.music_pre').click(function () {
      $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
    });
    //6.下一首
    $('.music_next').click(function () {
      $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
    });

    //7.监听删除按钮
    $('.content_list').delegate('.list_menu_del', 'click', function () {

      //找到被电击的音乐
      let $item = $(this).parents(".list_music");
      //判断是否是正在播放的
      if ($item.get(0).index == player.currentIndex) {
        $('.music_next').trigger('click');
      }
      $item.remove();
      player.changeMusic($item.get(0).index);

      //重新排序
      $(".list_music").each(function (index, ele) {
        ele.index = index;
        $(ele).find(".list_number").text(index + 1);
      })
    })

    //双击音乐条播放音乐
    $('.content_list').delegate('.list_music', 'dblclick', function () {
      $(this).eq(0).find('.list_menu_play').trigger('click');
    })

    //8.监听播放的进度
    player.$audio.on('timeupdate', function () {
      //console.log(player.getMusicDuration(),player.getMuiscCurrentTime());
      let duration = player.getMusicDuration();//总时长
      let currentTime = player.getMuiscCurrentTime();//当前时间
      let timeStr = formatDate(currentTime, duration);
      //console.log(timeStr);
      //如果播放完，执行下一首
      let line_width = $('.music_progress_line').width();
      let bar_width = $('.music_progress_bar').width();
      if (line_width == bar_width) {
        $('.music_progress_line').width(0);
        $('.music_next').trigger('click');
      }
      //同步页面的时间
      $('.music_progress_time').text(timeStr);
      //同步进度条
      let value = currentTime / duration * 100;
      progress.setProgress(value);
      //实现歌词的同步
      let index = lyric.currentIndex(currentTime);
      let $item = $(".song_lyric li").eq(index);
      $item.addClass("cur");
      $item.siblings().removeClass("cur");

      // 实现歌词滚动
      if (index <= 2) return;
      $(".song_lyric").css({
        marginTop: (-index + 2) * 40
      });
    })

    //9.监听声音按钮的事件
    $('.music_voice_icon').click(function () {
      //图标切换
      $(this).toggleClass('music_voice_icon2');
      //声音切换
      if ($(this).attr('class').indexOf('music_voice_icon2') != -1) {
        //静音
        player.musicVoiceSeekTo(0);
        $('.music_voice_line').css('width', 0)
      } else {
        //有声音
        player.musicVoiceSeekTo(1);
        $('.music_voice_line').css('width', 100 + '%')
      }
    })
  }





  //定义crateMusicaItem方法，创建一条音乐
  function crateMusicaItem(index, music) {
    let $item = $(`
    <li class="list_music">
      <div class="list_check">
        <div class="check "><i class="fa fa-check" aria-hidden="true"></i></div>
      </div>
      <div class="list_number">`+ (index + 1) + `</div>
      <div class="list_name">`+ music.name + `
        <div class="list_menu">
          <a class="list_menu_play" href="javascript:;" title="播放"></a>
          <a class="list_menu_add" href="javascript:;" title="添加"></a>
          <a class="list_menu_down" href="javascript:;" title="下载"></a>
          <a class="list_menu_out" href="javascript:;" title="分享"></a>
        </div></div>
      <div class="list_singer">`+ music.singer + `</div>
      <div class="list_time">
        <span>`+ music.time + `</span>
        <a class='list_menu_del' href="javascript:;" title="删除"></a>
      </div>
    </li>`)

    $item.get(0).index = index;
    $item.get(0).music = music;
    return $item;
  }

  //2.初始化歌曲信息
  function initMusicInfo(music) {
    //获取需要修改的每一个元素
    let $musicImage = $('#imges');
    let $musicName = $('.song_info_name a');
    let $musicSinger = $('.song_info_singer a');
    let $musicAblum = $('.song_info_ablum a');
    let $musicProgressName = $('.music_progress_name');
    let $musicProgressTime = $('.music_progress_time');
    let $musicmask_bg = $('.mask_bg');//背景
    //给对应的元素进行赋值
    $musicImage.attr('src', music.cover);
    $musicName.text(music.name);
    $musicSinger.text(music.singer);
    $musicAblum.text(music.album);
    $musicProgressName.text(music.name + '  - ' + music.singer);
    $musicProgressTime.text('00:00 / ' + music.time);
    $musicmask_bg.css('background', 'url(' + music.cover + ')');
  }
  //3.初始化歌词信息
  function initMusicLyric(music) {
    lyric = new Lyric(music.link_lrc);
    let $lyricContainer = $('.song_lyric');
    // 清空上一首音乐的歌词
    $lyricContainer.html("");
    lyric.loadLyric(function () {
      //创建歌词列表
      $.each(lyric.lyrics, function (index, ele) {
        let $item = $('<li>' + ele + '</li>');

        $lyricContainer.append($item);
      })

    });
  }
  //定义一个格式化时间的方法
  function formatDate(currentTime, duration) {
    //总时间
    let endMin = parseInt(duration / 60);//分钟
    let endSec = parseInt(duration % 60);//秒
    if (endMin < 10) {
      endMin = '0' + endMin;
    }
    if (endSec < 10) {
      endSec = '0' + endSec;
    }
    //当前播放的时间
    let starMin = parseInt(currentTime / 60);//分钟
    let starSec = parseInt(currentTime % 60);//秒
    if (starMin < 10) {
      starMin = '0' + starMin;
    }
    if (starSec < 10) {
      starSec = '0' + starSec;
    }
    return starMin + ':' + starSec + ' / ' + endMin + ':' + endSec;
  }
})
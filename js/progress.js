(function (window) {
  function Progress($progressBar, $progressLine, $progressDot) {
    return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
  }
  Progress.prototype = {
    constructor: Progress,
    init: function ($progressBar, $progressLine, $progressDot) {
      this.$progressBar = $progressBar;
      this.$progressLine = $progressLine;
      this.$progressDot = $progressDot;
    },
    isMove: false,
    progressClick: function (callBack) {
      let $this = this; // 此时此刻的this是progress
      // 监听背景的点击
      this.$progressBar.click(function (event) {
        // 获取背景距离窗口默认的位置
        let normalLeft = $(this).offset().left;
        // 获取点击的位置距离窗口的位置
        let eventLeft = event.pageX;
        $this.$progressLine.css('width', eventLeft - normalLeft);
        $this.$progressDot.css('left', eventLeft - normalLeft);
        //计算进度条的比例
        let value = (eventLeft - normalLeft) / $(this).width;
        callBack(value);
      });
    },
    progressMove: function (callBack) {
      let $this = this;
      let normalLeft = this.$progressBar.offset().left;
      let eventLeft;
      //1.监听鼠标按下事件
      this.$progressBar.mousedown(function () { 
        // 获取背景距离窗口默认的位置
        
        //2.监听鼠标的移动状态
        $(document).mousemove(function (event) {
          // 获取点击的位置距离窗口的位置
          eventLeft = event.pageX;
          $this.$progressLine.css('width', eventLeft - normalLeft);
          $this.$progressDot.css('left', eventLeft - normalLeft);
          
        });
      });
      //3.监听鼠标抬起事件
      $(document).mouseup(function () {
        //移出监听鼠标移动的事件
        $(document).off('mousemove');
        //计算进度条的比例
        let value = (eventLeft - normalLeft) / $this.$progressBar.width();
        callBack(value);
      });
    },
    setProgress: function (value) {
      if (value < 0 || value > 100) return
      this.$progressLine.css({
        width: value + '%'
      });
      this.$progressDot.css({
        left: value + '%'
      })
    }


  }
  Progress.prototype.init.prototype = Progress.prototype;
  window.Progress = Progress;
})(window);
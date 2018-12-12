$(function () {
  // 懒加载
  $(".lazyload").lazyload({ effect: "fadeIn" });

  // 轮播图时间
  $('.carousel').carousel({
    interval: 2000
  })

  // 轮播图加active
  $('.carousel-inner').children().eq(0).addClass('active')

  // 返回顶部
  function backTop () {
    $(window).scroll(function () {
      var top = document.body.scrollTop == 0 ? document.documentElement.scrollTop : document.body.scrollTop
      top > 200 ? $('.backTop').show() : $('.backTop').hide()
    })
  }
  backTop()

  $('.inviteCode').on('click', function () {
    $('.inviteCodeInput').toggleClass('hidden')
  })

});
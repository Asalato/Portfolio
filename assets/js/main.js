const trueResize = new CustomEvent('trueResize');
let currentWidth;
let currentHeight;
$(window).ready(function(){
    currentWidth = $(window).width();
    currentHeight = $(window).height();
});
$(window).resize(function(){
    const width = $(window).width();
    const height = $(window).height();
    if(width === currentWidth && height === currentHeight) return;
    currentHeight = height;
    currentWidth = width;
    window.dispatchEvent(trueResize);
});

$(window).on('load', function () {
    $('.level-bar-inner').each(function () {
        var itemWidth = $(this).data('level');
        $(this).animate({
            width: itemWidth
        }, 800);
    });
});


$(window).ready(function ($) {
    $('.level-bar-inner').css('width', '0');
    $('.level-label').tooltip();
    $('#rss-feeds').rss(
        'https://qiita.com/Asalato/feed.atom',
        {
            limit: 3,
            effect: 'slideFastSynced',
            ssl: true,
            layoutTemplate: '<div class="items">{entries}</div>',
            entryTemplate: '<div class="item"><h3 class="title"><a href="{url}" target="_blank">{title}</a></h3><div><p>{shortBodyPlain}</p><a class="more-link" href="{url}" target="_blank"><i class="fas fa-external-link-alt"></i>Read more</a></div></div>'
        }
    );

    new GitHubCalendar('#github-graph', 'Asalato');

    GitHubActivity.feed({username: 'Asalato', selector: '#ghfeed'});
});

$('.toggle').click(function () {
    if($('.toggle').css('pointer-events') === 'none') return;

    let toggles = $('.toggle').not($(this));
    let thiselm = $(this);
    toggles.each(function (index, element) {
        if (!$(element).next().children().has(thiselm).length) {
            $(element).removeClass('open');
            let slideelm = $(element).closest('.item.row').length ? $(element).closest('.item.row').find('.toggle-child') : $(element).nextAll('.toggle-child');
            slideelm.slideUp(300, function () {
                $(element).find('.heading').css('margin-bottom', '0px');
            });
        }
    });
    if ($(this).hasClass('open')) {
        let element = $(this);
        element.removeClass('open');
        let slideelm = $(element).closest('.item.row').length ? $(element).closest('.item.row').find('.toggle-child') : $(element).nextAll('.toggle-child');
        slideelm.slideUp(300, function () {
            element.find('.heading').css('margin-bottom', '0px');
        });
    } else {
        $(this).addClass('open');
        $(this).find('.heading').css('margin-bottom', '30px');
        let slideelm = $(this).closest('.item.row').length ? $(this).closest('.item.row').find('.toggle-child') : $(this).nextAll('.toggle-child');
        slideelm.slideDown(300);
    }
});

window.addEventListener('trueResize', function () {
    if ('none' === $('.toggle').css('pointer-events')) {
        $('.toggle').removeClass('open');
        $('.toggle').show();
        $('.toggle').find('.heading').css('margin-bottom', '30px');
        $('.toggle-child').slideDown(300);
    } else {
        $('.toggle').each(function () {
            let element = $(this);
            element.nextAll('.toggle-child').slideUp(300, function () {
                element.find('.heading').css('margin-bottom', '0px');
            });
        });
    }

    rePositionAside();
});

$(document).ready(function () {
    rePositionAside();
});

function rePositionAside() {
    if (window.innerWidth < 992) {
        $('.info.aside.section').prependTo($('.primary'));
    } else {
        $('.info.aside.section').prependTo($('.secondary'));
    }
}
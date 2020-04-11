$(window).on('load', function () {

    $('.level-bar-inner').each(function () {

        var itemWidth = $(this).data('level');

        $(this).animate({
            width: itemWidth
        }, 800);

    });

});


jQuery(document).ready(function ($) {


    /*======= Skillset *=======*/

    $('.level-bar-inner').css('width', '0');


    /* Bootstrap Tooltip for Skillset */
    $('.level-label').tooltip();


    /* jQuery RSS - https://github.com/sdepold/jquery-rss */

    $('#rss-feeds').rss(
        //Change this to your own rss feeds
        'https://qiita.com/Asalato/feed.atom',

        {
            // how many entries do you want?
            // default: 4
            // valid values: any integer
            limit: 3,

            // the effect, which is used to let the entries appear
            // default: 'show'
            // valid values: 'show', 'slide', 'slideFast', 'slideSynced', 'slideFastSynced'
            effect: 'slideFastSynced',

            // will request the API via https
            // default: false
            // valid values: false, true
            ssl: true,

            // outer template for the html transformation
            // default: "<ul>{entries}</ul>"
            // valid values: any string
            layoutTemplate: '<div class="items">{entries}</div>',

            // inner template for each entry
            // default: '<li><a href="{url}">[{author}@{date}] {title}</a><br/>{shortBodyPlain}</li>'
            // valid values: any string
            entryTemplate: '<div class="item"><h3 class="title"><a href="{url}" target="_blank">{title}</a></h3><div><p>{shortBodyPlain}</p><a class="more-link" href="{url}" target="_blank"><i class="fas fa-external-link-alt"></i>Read more</a></div></div>'

        }
    );

    /* Github Calendar - https://github.com/IonicaBizau/github-calendar */
    new GitHubCalendar('#github-graph', 'Asalato');


    /* Github Activity Feed - https://github.com/caseyscarborough/github-activity */
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

$(window).resize(function () {
    if ('none' === $('.toggle').css('pointer-events')) {
        $('.toggle').attr('style', '');
        $('.toggle').find('.heading').css('margin-bottom', '30px');
        $('.toggle').nextAll('.toggle-child').slideDown(300);
    } else {
        $('.toggle').each(function () {
            if ($(this).hasClass('open')) {
                $(this).find('.heading').css('margin-bottom', '30px');
                $(this).nextAll('.toggle-child').slideDown(300);
            } else {
                let element = $(this);
                element.nextAll('.toggle-child').slideUp(300, function () {
                    element.find('.heading').css('margin-bottom', '0px');
                });
            }
        });
    }

    rePositionAside();
});

window.onload = function () {
    rePositionAside();
};

function rePositionAside() {
    if (window.innerWidth < 992) {
        $('.info.aside.section').prependTo($('.primary'));
    } else {
        $('.info.aside.section').prependTo($('.secondary'));
    }
}
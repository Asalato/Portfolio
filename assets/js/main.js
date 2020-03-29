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

    $("#rss-feeds").rss(
        //Change this to your own rss feeds
        "https://qiita.com/Asalato/feed.atom",

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
            layoutTemplate: "<div class='items'>{entries}</div>",

            // inner template for each entry
            // default: '<li><a href="{url}">[{author}@{date}] {title}</a><br/>{shortBodyPlain}</li>'
            // valid values: any string
            entryTemplate: '<div class="item"><h3 class="title"><a href="{url}" target="_blank">{title}</a></h3><div><p>{shortBodyPlain}</p><a class="more-link" href="{url}" target="_blank"><i class="fas fa-external-link-alt"></i>Read more</a></div></div>'

        }
    );

    /* Github Calendar - https://github.com/IonicaBizau/github-calendar */
    new GitHubCalendar("#github-graph", "Asalato");


    /* Github Activity Feed - https://github.com/caseyscarborough/github-activity */
    GitHubActivity.feed({username: "Asalato", selector: "#ghfeed"});


});

$('.toggle').click(function () {
    $('.toggle').not(this).removeClass('open');
    $('.toggle').not(this).next().slideUp(300);
    $('.toggle').not(this).find('.heading').css('margin-bottom', '0px');
    if ($(this).hasClass('open')) {
        let element = $(this);
        element.removeClass('open');
        element.next().slideUp(300, function () {
            element.find('.heading').css('margin-bottom', '0px');
        });
    } else {
        $(this).addClass('open');
        $(this).find('.heading').css('margin-bottom', '30px');
        $(this).next().slideDown(300);
    }
});

$(window).resize(function () {
    if ('none' === $('.toggle').css('pointer-events')) {
        $('.toggle').attr('style', '');
        $('.toggle').find('.heading').css('margin-bottom', '30px');
        $('.toggle').next().slideDown(300);
    } else {
        $('.toggle').each(function () {
            if ($(this).hasClass('open')) {
                $(this).find('.heading').css('margin-bottom', '30px');
                $(this).next().slideDown(300);
            } else {
                let element = $(this);
                element.next().slideUp(300, function () {
                    element.find('.heading').css('margin-bottom', '0px');
                });
            }
        });
    }
});
$(document).ready(function () {

    /**
     *
     * @param row
     */

    var equalizeColumnHeights = function (row) {
        var columns = row.children('div').filter(function () {
            return $(this).attr('class').indexOf('col') != -1;
        }).height('auto');

        columns.outerHeight(row.height());
    };

    var projectOverview = $('.project-overview');

    var centerProjectDescription = function (topSection) {
        var h1Height = projectOverview.find('h1').outerHeight(true);

        projectOverview.css('padding-top',
            (topSection.height() - h1Height - projectOverview.find('.project-description').height())/2
        );
    };

    var resizeTimeout;
    var topSection = $('.top-section');

    $(window).resize(function () {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function() {
            equalizeColumnHeights(topSection);
            centerProjectDescription(topSection);
        }, 20);
    });

    $(window).resize();

});
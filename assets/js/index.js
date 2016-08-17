var coordinates = (function () {
    var that = {};

    /**
    * Creates a coordinates object
    * @param left
    * @param top
    * @returns {{left: number, top: number}}
    */

    that.create = function (left, top) {
        return {left: left, top: top}
    };

    /**
     * Subtracts create of one create objects from create of other coordinate object
     * @param {{left: number, top: number}} coords
     * @param {{left: number, top: number}} otherCoords
     * @returns {{left, top}|{left: number, top: number}}
     */

    that.add = function (coords, otherCoords) {
        return that.create(coords.left + otherCoords.left, coords.top + otherCoords.top)
    };

    /**
     * Multiplies coordinates by scalar
     * @param {number} scalar
     * @param {{left: number, top: number}} coords
     * @returns {{left, top}|{left: number, top: number}}
     */

    that.multiplyByScalar = function (scalar, coords) {
        return that.create(coords.left * scalar, coords.top * scalar)
    };

    /**
     * Subtracts corresponding coordinates of points
     * @param {{left: number, top: number}} point
     * @param {{left: number, top: number}} otherPoint
     * @returns {{left: number, top: number}}
     */

    that.subtract = function (point, otherPoint) {
        return that.add(point, that.multiplyByScalar(-1, otherPoint))
    };

    /**
     * Divides coordinates of one point by corresponding coordinates of other point
     * @param point
     * @param otherPoint
     * @returns {{left, top}|{left: number, top: number}}
     */

    that.divide = function (point, otherPoint) {
        return that.create(point.left / otherPoint.left, point.top / otherPoint.top)
    };

    return that;
})();

var bonesSlideInAnimation = function (topSection, bones) {
    var setTransition = function (DOMElement, transitionValue) {
        DOMElement.css({
            '-webkit-transition': transitionValue,
            '-moz-transition' : transitionValue,
            '-ms-transition': transitionValue,
            '-o-transition': transitionValue,
            'transition': transitionValue
        });
    };

    var topSectionDimensions = coordinates.create(topSection.width(), topSection.height());

    var initialPositions = {};

    // record initial position of each bone
    bones.each(function () {
        initialPositions[$(this).attr('class')] = $(this).position();
    }).
    // hide every bone
    each(function () {
        var $this = $(this);
        var position = $this.position();

        var shift = Math.min(position.top + $this.height(), position.left + $this.width());
        shift = shift > 0 ? shift: 0;
        var minimalTOHide = coordinates.subtract(position, coordinates.create(shift, shift));
        $this.css(coordinates.multiplyByScalar(2, minimalTOHide));
    });

    // without this timeout transition property is set to the last element selected earlier than it is hidden
    // so it appears as it is not moving at all
    setTimeout(function () {
        setTransition(bones, "top 1s, left 1s");
        bones.css('visibility', 'visible');

        bones.each(function () {
            var $this = $(this);
            var className = $this.attr('class');
            var initialPosition = coordinates.multiplyByScalar(100, initialPositions[className]);
            var positionINPercent = coordinates.divide(initialPosition, topSectionDimensions);

            $this.css(coordinates.add(positionINPercent, coordinates.create("%", "%")));
        });
    }, 1);
};

var topSectionAnimation = function ($window, topSection) {

    topSection.height($window.height());

    // apparently safari stalls with setting height of a top section, so without this timeout
    // every thing will be bundled together in upper left corner
    setTimeout(function () {
        bonesSlideInAnimation(topSection, $('.bones').find('.bone'));
    }, 10);

    var initialPosition = topSection.offset();

    /**
     * Return an object containing create of a center of a block relative to document
     * @param {Object} block, jQuery object
     * @returns {{left: number, top: number}}
     */

    var blockCenterPos = function (block) {
        var blockPos = block.offset();

        return coordinates.create(
            blockPos.left + block.width() / 2,
            blockPos.top + block.height() / 2
        );
    };

    /**
     * Positions a block relative to center of a top section
     * @param {{Object}} event, javascript event object
     * @param {{jQuery Object}} centerBlock, block relative to center of which moving element is positioned
     * @param {{jQuery Object}} movingBlock, block to be moved
     */

    var makeConcentricMovement = function (event, centerBlock, movingBlock) {
        var mouseTOCenterVector = coordinates.subtract(
            {left: event.pageX, top: event.pageY},
            blockCenterPos(centerBlock)
        );

        var destinationCoordinates = coordinates.add(
            initialPosition,
            coordinates.multiplyByScalar(-0.1, mouseTOCenterVector)
        );

        movingBlock.css(destinationCoordinates);
    };

    /**
     * Moves background block with bone like objects in it
     * @param {{Event}} event
     */

    var moveBones = (function () {
        var bones = topSection.find('.bones');
        return function (event) {
            makeConcentricMovement(event, topSection, bones);
        }
    })();

    var resizeTimeout;

    $window.
    resize(function () {
        clearTimeout(resizeTimeout);

        setTimeout(function () {
            topSection.height($window.height());
        }, 20);
    }).
    mousemove(moveBones);

};

$(window).on("load", function () {
    var $window = $(window);
    var topSection = $('.top-section');

    topSectionAnimation($window, topSection);

    $window.mousemove();
});

var coordinates = (function () {
    var that = {};

    /**
    * Creates a create object
    * @param left
    * @param top
    * @returns {{left: number, top: number}}
    */

    that.create = function (left, top) {
        return {left: left, top: top}
    };

    /**
     * Subtracts create of one create objects from create of other coordinate object
     * @param coords
     * @param otherCoords
     * @returns {{left, top}|{left: number, top: number}}
     */

    that.add = function (coords, otherCoords) {
        return that.create(coords.left + otherCoords.left, coords.top + otherCoords.top)
    };

    that.multiplyByScalar = function (scalar, coords) {
        return that.create(coords.left * scalar, coords.top * scalar)
    };

    /**
     * Calculates coordinates of a vector that goes from point to another point
     * @param {{left: number, top: number}} firstPoint
     * @param {{left: number, top: number}} secondPoint
     * @returns {{left: number, top: number}}
     */

    that.subtract = function (firstPoint, secondPoint) {
        return that.add(firstPoint, that.multiplyByScalar(-1, secondPoint))
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

    var distanceMultiplicator = function (bonePos, containerDimensions) {
        var differences = coordinates.subtract(containerDimensions, bonePos);
        return Math.sqrt(differences.top ^ 2 + differences.left ^ 2);
    };

    var containerDimensions = coordinates.create({
        top: topSection.height(),
        left: topSection.width()
    });

    var initialPositions = {};

    bones.each(function () {
        initialPositions[$(this).attr('class')] = $(this).position();
    }).
    each(function () {
        var $this = $(this);
        var position = $this.position();

        var shift = Math.min(position.top + $this.height(), position.left + $this.width());
        shift = shift > 0 ? shift: 0;
        var minimalTOHide = coordinates.subtract(position, coordinates.create(shift, shift));
        $this.css(coordinates.multiplyByScalar(distanceMultiplicator(position, containerDimensions), minimalTOHide));
    }).
    each(function () {
        setTransition($(this), 'top 0.5s, left 0.5s');
    }).
    each(function () {
        var $this = $(this);
        var className = $this.attr('class');

        $this.css(initialPositions[className]);
    })
};

var topSectionAnimation = function ($window, topSection) {

    topSection.height($window.height());
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

    var moveBones = function (event) {
        makeConcentricMovement(event, topSection, topSection.find('.bones'));
    };

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

$(document).ready(function () {
    var $window = $(window);
    var topSection = $('.top-section');

    topSectionAnimation($window, topSection);
    bonesSlideInAnimation(topSection, $('.bones').find('.bone'));

    $window.mousemove();
});

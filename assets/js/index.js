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

/**
 * Return an object containing create of a center of a block relative to document
 * @param {Object} block, jQuery object
 * @returns {{left: number, top: number}}
 */

blockCenter = function (block) {
    var blockPos = block.position();

    return coordinates.create(
        blockPos.left + block.width() / 2,
        blockPos.top + block.height() / 2
    );
};

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

    var sign = function (number) {
        if (number === 0) {
            return 0
        }
        return Math.abs(number) / number
    };

    /**
     * Takes a vector prolongs it so it's end would lie on a border of a block that it is contained within
     * @param vector
     * @param startingPoint, startingPoint of a vector, coordinates must be local to block
     * @param {{top: number, left: number}} blockDimensions, height and width of a block
     */

    var extendVectorTOSide = function (vector, startingPoint, blockDimensions) {
        var distanceTOSides = coordinates.subtract(blockDimensions, startingPoint);

        if (Math.abs(vector.top / vector.left) > distanceTOSides.top / distanceTOSides.left) {
            return coordinates.create(
                vector.left * (distanceTOSides.top / Math.abs(vector.top)),
                distanceTOSides.top * sign(vector.top)
            )
        } else {
            return coordinates.create(
                distanceTOSides.left * sign(vector.left),
                vector.top * (distanceTOSides.left / Math.abs(vector.left))
            )
        }
    };

    var topSectionDimensions = coordinates.create(topSection.width(), topSection.height());
    var topSectionCenter = blockCenter(topSection);

    var initialPositions = {};

    // record initial position of each bone
    bones.each(function () {
        initialPositions[$(this).attr('class')] = $(this).position();
    }).
    // hide every bone
    each(function () {
        var $this = $(this);
        var position = blockCenter($this);

        var centerTOCurrent = coordinates.subtract(position, topSectionCenter);
        var centerTOSide = extendVectorTOSide(centerTOCurrent, topSectionCenter, topSectionDimensions);
        var currentTOHidden = coordinates.subtract(coordinates.multiplyByScalar(2, centerTOSide), centerTOCurrent);
        $this.css(coordinates.add(position, currentTOHidden));
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

var concentricMovement = (function () {

    var that = {};

    /**
     * Positions a block relative to center of a top section
     * @param {{Object}} event, javascript event object
     * @param {{jQuery Object}} container, block relative to center of which moving element is positioned
     * @param {{jQuery Object}} block, block to be moved
     * @param {{Object}} initialPosition, initial position of the moving block
     * @param {{number}} imitationCoefficient, number that defines how actively will block respond to mouse movement
     */

    var makeConcentricMovement = function (event, container, block, initialPosition, imitationCoefficient) {
        var centerTOMouseVector = coordinates.subtract(
            coordinates.subtract(coordinates.create(event.pageX, event.pageY), container.offset()),
            blockCenter(container)
        );

        var destinationCoordinates = coordinates.add(
            initialPosition,
            coordinates.multiplyByScalar(imitationCoefficient, centerTOMouseVector)
        );

        block.css(destinationCoordinates);
    };

    /**
     * Creates an event handler that will move block relative to center of another block according to mouse movement
     */

    that.create = function (container, block, imitationCoefficient) {
        var initialPosition = block.position();

        return function (event) {
            makeConcentricMovement(event, container, block, initialPosition, imitationCoefficient);
        }
    };

    return that;

})();

var topSectionAnimation = function ($window, topSection) {
    topSection.height($window.height());

    // apparently safari stalls with setting height of a top section, so without this timeout
    // every thing will be bundled together in upper left corner
    setTimeout(function () {
        bonesSlideInAnimation(topSection, $('.bones').find('.bone'));
    }, 10);

    var resizeTimeout;

    $window.
    resize(function () {
        clearTimeout(resizeTimeout);

        setTimeout(function () {
            topSection.height($window.height());
        }, 20);
    }).
    mousemove(concentricMovement.create(topSection, $('.bones'), -0.1)).
    mousemove(concentricMovement.create($('.small-shapes-layer'), $('.small-shapes-container'), 0.02));
    topSection.removeClass('pre-animation');

};

var pageSegment = function ($window) {
    var that = {};

    var createEndpoint = function (endpoints, endpoint, endpointNum, updateCause) {
        if (typeof endpoint !== "number") {
            $window.on(updateCause, function () {
                endpoints[endpointNum] = endpoint();
            });

            return endpoint();
        }

        return endpoint;
    };

    that.create = function (lowerEndpoint, upperEndpoint, updateCause) {
        var endpoints = [];

        endpoints[0] = createEndpoint(endpoints, lowerEndpoint, 0, updateCause);
        endpoints[1] = createEndpoint(endpoints, upperEndpoint, 1, updateCause);

        return endpoints;
    };

    return that;
};

var scrollTasksConstructor = function ($window) {
    var that = {};
    var tasks = [];

    $window.on('scroll', function () {
        var scrollTop = $window.scrollTop();

        for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            tasks[taskIndex](scrollTop)
        }
    });

    /**
     * Determines if number belongs to an interval
     * @param {{Array}} interval, array of two values defining boundaries of a interval
     * @param {{number}} number
     * @returns {boolean}
     */

    var numberInInterval = function (interval, number) {
        return interval[0] <= number && number <= interval[1];
    };

    /**
     * Takes a function that takes a scrollTop as an argument that will be run every time scrollTop is
     * within some interval, bound to DOMObject passed
     * @param {{jQuery Object}} DOMObject, block that the function will be bound to
     * @param pageSegment, page segment in which the task should be executed
     * @param taskFunc, function that takes scroll top as a parameter
     */

    that.assign = function (DOMObject, pageSegment, taskFunc) {
        var boundTask = taskFunc.bind(DOMObject);
        var triggeredAtEndpoint = false;

        tasks.push(function (scrollTop) {
            if (numberInInterval(pageSegment, scrollTop)) {
                triggeredAtEndpoint = false;
                boundTask(scrollTop - pageSegment[0], pageSegment[1]);
            } else if (!triggeredAtEndpoint) {
                triggeredAtEndpoint = true;
                boundTask(pageSegment[1], pageSegment[1]);
            }
        });
    };

    return that;
};

var scroll = function ($window, topSection) {
    var scrollTasks = scrollTasksConstructor($window);
    var pageSegments = pageSegment($window);

    var topSectionSegment = pageSegments.create(
        0, function () {
            return topSection.height();
        }, "resize"
    );

    scrollTasks.assign($('.background-rectangle'), topSectionSegment, function (scrollTop, upperEndpoint) {
        var invertedScrollProgress = 1 - scrollTop / upperEndpoint;
        var valueInPercent = (100 * invertedScrollProgress);

        this.css({
            'opacity': invertedScrollProgress,
            'height': valueInPercent + "%",
            'width': valueInPercent + "%",
            'margin-left': ((100 - valueInPercent) / 2) + "%"
        })
    });

    scrollTasks.assign($('.small-shapes-layer'), topSectionSegment, function (scrollTop, upperEndpoint) {
        this.css("opacity", 1 - scrollTop / upperEndpoint);
    });

    scrollTasks.assign($('.scroll'), pageSegments.create(0, 1), function (scrollTop, upperEndpoint) {
        if (scrollTop === 0) {
            this.css('display', 'block');
        } else {
            this.css('display', 'none');
        }
    });

    // bind scroll to resize, so that properties that depend on scroll dynamically update after resize
    $window.on('resize', function () {
        $window.scroll();
    })
};

$(window).on("load", function () {
    var $window = $(window);
    var topSection = $('.top-section');

    topSectionAnimation($window, topSection);

    scroll($window, topSection);

    $window.mousemove();
    $window.scroll();
});

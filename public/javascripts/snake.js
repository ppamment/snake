var SnakeGame = {
    'svg': d3.select('svg#game'),
    'snake': [{x:7, y:3},{x:6, y:3},{x:5, y:3}],
    'foodLocation': null,
    'foodElement': null,
    'velocity': {x: 1, y: 0},
    'nextVelocity': {x: 1, y: 0},
    'ticker': null,
    'gridSize': 40,
    'scale': null,
    'speed': 1,
    'increaseAfter': null,
    'increaseRatio': null,
    'points': 0,
    'velocityMap': {
        39: {x: 1, y: 0},
        37: {x: -1, y: 0},
        38: {x: 0, y: -1},
        40: {x: 0, y: 1}
    },

    'move': function ()
    {
        this.velocity = this.nextVelocity;
        var newHead = this.sumVectors(this.snake[0], this.velocity);
        this.snake.unshift(newHead);
        if(this.theSnakeAteTheFood()) {
            this.foodElement.remove();
            this.points++;
            this.adjustSpeed();
            this.makeNewFood();
        } else if (this.theSnakeHitAWall() || this.theSnakeHitItself()) {
            clearInterval(this.ticker);
            //this.svg.select("rect.dead").enter().append("rect").attr("class", "dead").attr("width", 400).attr("height", 400).attr("x", 0).attr("y", 0);
        } else {
            this.snake.pop();
        }
        this.drawSnake();
    },

    'adjustSpeed': function()
    {
        if(this.increaseAfter !== null && this.points % this.increaseAfter == 0){
            this.speed = this.speed*this.increaseRatio;
            this.initTicker();
        }
    },

    'drawSnake': function ()
    {
        var rectangles = this.svg.selectAll('rect.snake')
            .data(this.snake, function(d) {return JSON.stringify(d) });
        rectangles
            .enter()
            .append('rect')
            .attr('class', 'snake')
            .attr('width', this.scale.rangeBand())
            .attr('height', this.scale.rangeBand())
            .attr('x', function(d) {return this.scale(d.x)}.bind(this))
            .attr('y', function(d) {return this.scale(d.y)}.bind(this));

        rectangles.exit().remove();
    },

    'makeNewFood': function ()
    {
        this.foodLocation = [{x: Math.floor(Math.random()*this.gridSize), y: Math.floor(Math.random()*this.gridSize)}];
        this.drawFood();
    },

    'drawFood' : function ()
    {
        var rectangles = this.svg.selectAll("rect.food").data(this.foodLocation, function(d){ return JSON.stringify(d)});
        rectangles
            .enter()
            .append("rect")
            .attr("class", "food")
            .attr("width", this.scale.rangeBand())
            .attr("height", this.scale.rangeBand())
            .attr("x", function(d) {return this.scale(d.x)}.bind(this))
            .attr("y", function(d) {return this.scale(d.y)}.bind(this));

        this.foodElement = d3.select("rect.food");
    },

    "theSnakeAteTheFood" : function ()
    {
        return this.vectorsAreEqual(this.snake[0], this.foodLocation[0]);
    },

    "theSnakeHitAWall" : function ()
    {
        return this.snake[0].x < 0 || this.snake[0].x >= this.gridSize || this.snake[0].y < 0 || this.snake[0].y >= this.gridSize;
    },

    "theSnakeHitItself" : function ()
    {
        var i = this.snake.length-1;
        while(i > 0){
            if(this.vectorsAreEqual(this.snake[0], this.snake[i])){
                return true;
            }
            i--;
        }
        return false;
    },

    "vectorsAreEqual": function (a, b)
    {
        return a.x == b.x && a.y == b.y;
    },

    "sumVectors" : function (a, b)
    {
        return {x: a.x+ b.x, y: a.y+ b.y};
    },

    'initKeystrokes': function() {
        d3.select(window)
            .on("keydown", function() {
                var newVelocity = this.velocityMap[d3.event.keyCode];
                //make sure the new velocity isnt backing onto itself
                if(typeof newVelocity != "undefined" &&
                    newVelocity.x != -this.velocity.x &&
                    newVelocity.y != -this.velocity.y
                ){
                    //set the velocity that will be used next time the snake moves
                    this.nextVelocity = newVelocity;
                }
                d3.event.preventDefault();
            }.bind(this));
    },

    "setOptions": function(options)
    {
        for(var key in options){
            this[key] = options[key];
        }
    },

    "initTicker": function()
    {
        if(null !== this.ticker){
            clearInterval(this.ticker);
        }
        this.ticker = setInterval(this.move.bind(this), 100/this.speed);
    },

    init: function()
    {
        this.scale = d3.scale.ordinal().domain(d3.range(this.gridSize)).rangeRoundBands([0, 400], 0.0);
        this.initKeystrokes();
        this.makeNewFood();
        this.drawSnake();
        this.initTicker();
    }
};

SnakeGame.setOptions({
    speed:1,
    increaseAfter: 5,
    increaseRatio: 1.2
});
SnakeGame.init();
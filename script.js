var road_canvas = document.getElementById("road_canvas");
var road_ctx = road_canvas.getContext('2d');
var roadLeft = road_canvas.offsetLeft + road_canvas.clientLeft;
var roadTop = road_canvas.offsetTop + road_canvas.clientTop;

var demo_canvas = document.getElementById("demo_canvas");
var demo_ctx = demo_canvas.getContext('2d');
var demoLeft = demo_canvas.offsetLeft + demo_canvas.clientLeft;
var demoTop = demo_canvas.offsetTop + demo_canvas.clientTop;

var demo_canvas_bis = document.getElementById("demo_canvas_bis");
var demo_ctx_bis = demo_canvas_bis.getContext('2d');
var demoLeft_bis = demo_canvas_bis.offsetLeft + demo_canvas_bis.clientLeft;
var demoTop_bis = demo_canvas_bis.offsetTop + demo_canvas_bis.clientTop;

var new_road_btn = document.getElementById("new_road_btn");
var finish_road_btn = document.getElementById("finish_road_btn");
var edit_road_btn = document.getElementById("edit_road_btn");

const STD_RADIUS = 145;
const STD_CENTER = 45;
var ROAD_DRAWING = true;
var ROAD_EDITING = false;
var ROAD_EDITING_ON = false;
var road = [[0,road_canvas.height],
            [0,STD_RADIUS],
            [road_canvas.width,STD_RADIUS],
            [road_canvas.width,road_canvas.height]];
var editing_start_x = 0;
var editing_start_y = 0;
var editing_point_index = 0;

var road_pattern_length = road_canvas.width;
var wheel_polar = [];
var wheel_cartesian = [];

var wheelCenter_x = demo_canvas.width/2;
var wheelCenter_y = demo_canvas.height/2;


road_canvas.addEventListener('click', function(event) {
    // console.log('[' + (event.pageX-roadLeft) + ',' + (event.pageY-roadTop) +']');
    var x = event.pageX-roadLeft;
    var y = event.pageY-roadTop;
    if(ROAD_DRAWING){
        var i = 0;
        while(i<road.length && road[i][0]<=x){
            i++;
        }
        road.splice(i,0, [x, y] );
        redrawRoad(false);
        calculate_wheel();
        calculate_cartesian();
        redrawDemo();
    };
});
road_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-roadLeft;
    var y = event.pageY-roadTop;
    if(ROAD_EDITING){
        editing_point_index = -1;
        for(i=0; i<road.length; i++){
            var pt = road[i];
            var dist = Math.sqrt( (x-pt[0])**2 + (y-pt[1])**2 );
            if(dist<10 && editing_point_index==-1){
                editing_point_index = -2;
            }
            if(dist<5){
                editing_point_index = i;
            }
        }
        if(editing_point_index ==0 || editing_point_index == road.length-1){
            editing_point_index = -1;
        }
        if(event.button == 0 && editing_point_index>=0){
            ROAD_EDITING_ON = true;
            editing_start_x = x;
            editing_start_y = y;
            drawCircle(road_ctx,
                road[editing_point_index][0],
                road[editing_point_index][1], 5, "#FFF0", "#F00");
        }
        if(event.button == 2 && editing_point_index>=0){
            road = road.slice(0,editing_point_index).concat(road.slice(editing_point_index+1));
        }
        if(event.button == 2 && editing_point_index==-1){
            var i = 0;
            while(i<road.length && road[i][0]<=x){
                i++;
            }
            road.splice(i,0, [x, y] );
        }
        redrawRoad();
        calculate_wheel();
        calculate_cartesian();
        redrawDemo();
    };
    
});
road_canvas.addEventListener('mousemove', function(event) {
    if(ROAD_EDITING_ON){
        if(road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x>road[editing_point_index-1][0]
            && road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x<road[editing_point_index+1][0]){
            road[editing_point_index][0] += event.pageX-roadLeft-editing_start_x;
            editing_start_x = event.pageX-roadLeft;
        }
        road[editing_point_index][1] += event.pageY-roadTop-editing_start_y;
        editing_start_y = event.pageY-roadTop;
        redrawRoad();
        drawCircle(road_ctx,
            road[editing_point_index][0],
            road[editing_point_index][1], 5, "#FFF0", "#F00");
    };
});
road_canvas.addEventListener('mouseup', function(event) {
    if(ROAD_EDITING_ON){
        ROAD_EDITING_ON = false;
        redrawRoad();
        calculate_wheel();
        calculate_cartesian();
        redrawDemo();
    };
});
road_canvas.oncontextmenu = function(e){
    e.preventDefault();
    e.stopPropagation();
}

new_road_btn.addEventListener('click', function(event){
    road = [[0,road_canvas.height],
            [0,STD_RADIUS],
            [road_canvas.width,STD_RADIUS],
            [road_canvas.width,road_canvas.height]];
    ROAD_DRAWING=true;
    ROAD_EDITING=false;
    edit_road_btn.textContent = "Edit Road OFF";
    redrawRoad();
    calculate_wheel();
    calculate_cartesian();
    redrawDemo();
});
finish_road_btn.addEventListener('click', function(event){
    ROAD_DRAWING=false;
    ROAD_EDITING=false;
    redrawRoad();
    calculate_wheel();
    calculate_cartesian();
    redrawDemo();
});
edit_road_btn.addEventListener('click', function(event){
    ROAD_DRAWING=false;
    if (ROAD_EDITING){
        ROAD_DRAWING=false;
        ROAD_EDITING=false;
        edit_road_btn.textContent = "Edit Road OFF";
    } else{
        ROAD_DRAWING=false;
        ROAD_EDITING=true;
        edit_road_btn.textContent = "Edit Road ON";
    };
    redrawRoad();
    calculate_wheel();
    calculate_cartesian();
    redrawDemo();
});



redrawRoad();
calculate_wheel();
calculate_cartesian();
redrawDemo();